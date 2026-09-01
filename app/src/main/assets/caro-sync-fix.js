/* ════════════════════════════════════════════════════════════
   CARO SYNC FIX v1 — 데이터 영속화 · 뒤로가기 · 추가운전자
   ────────────────────────────────────────────────────────────
   ① localStorage ↔ Firestore 자동 미러
      - 카드/면허/크레딧/쿠폰/요금제 등 기기에만 저장되던 데이터를
        users/{uid} 문서에 자동 백업하고, 로그인 시 자동 복원.
      - 새로고침·로그아웃·기기 변경 후에도 데이터 유지.
   ② 안드로이드 시스템 뒤로가기 버튼 지원 (화면 이력 연동)
   ③ 추가운전자 등록 (구 동승운전자) — 면허 형식 검증 포함
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ═══ 1. localStorage ↔ Firestore 미러 ═══ */
var MIRROR_RE=/^caro_(pay_data|pay_uid|apd_|license|license_registered|data_|plan_v1|bl_cars_v1|extra_driver)/;
var SKIP_RE=/(pw|ai_key|auto_login|saved_id|auto_id|auto_name|android_banner)/;
var TS_KEY='caro_mirror_ts';
var pushTimer=null, pulling=false;

function uid(){ try{ return (window.FB_AUTH&&window.FB_AUTH.currentUser)?window.FB_AUTH.currentUser.uid:null; }catch(e){ return null; } }
function fbOK(){ return !!(window.FB_DB&&window.FB_FN&&window.FB_FN.setDoc&&window.FB_FN.doc&&window.FB_FN.getDoc); }
function tsMap(){ try{ return JSON.parse(localStorage.getItem(TS_KEY)||'{}'); }catch(e){ return {}; } }
function setTs(k,t){ try{ var m=tsMap(); m[k]=t; localStorage.setItem(TS_KEY,JSON.stringify(m)); }catch(e){} }

function collect(){
  var out={}, m=tsMap();
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(!MIRROR_RE.test(k)||SKIP_RE.test(k)) continue;
      var v=localStorage.getItem(k);
      if(v==null||v.length>180000) continue;   /* Firestore 문서 1MB 제한 보호 */
      out[k]={v:v,t:m[k]||Date.now()};
    }
  }catch(e){}
  return out;
}

function push(){
  var u=uid(); if(!u||!fbOK()||pulling) return;
  var fn=window.FB_FN, db=window.FB_DB;
  var data=collect();
  if(!Object.keys(data).length) return;
  fn.setDoc(fn.doc(db,'users',u),{ caroMirror:data, caroMirrorAt:Date.now() },{merge:true})
    .then(function(){ console.log('☁️ 내 데이터 서버 백업 완료 ('+Object.keys(data).length+'개)'); })
    .catch(function(e){ console.warn('☁️ 서버 백업 실패:',e&&e.code); });
}
function schedulePush(){ if(pushTimer)clearTimeout(pushTimer); pushTimer=setTimeout(push,1500); }

window.caroSyncPush=push;
window.caroSyncPull=function(u){
  if(!u||!fbOK()) return Promise.resolve(false);
  var fn=window.FB_FN, db=window.FB_DB;
  pulling=true;
  return fn.getDoc(fn.doc(db,'users',u)).then(function(snap){
    pulling=false;
    if(!snap||typeof snap.data!=='function') return false;
    var d=snap.data(); if(!d||!d.caroMirror) return false;
    var mir=d.caroMirror, m=tsMap(), applied=0;
    Object.keys(mir).forEach(function(k){
      if(!MIRROR_RE.test(k)||SKIP_RE.test(k)) return;
      var srv=mir[k]; if(!srv||typeof srv.v!=='string') return;
      var localT=m[k]||0;
      var has=null;
      try{ has=localStorage.getItem(k); }catch(e){}
      if(has==null || (srv.t||0)>localT){
        try{ localStorage.setItem(k,srv.v); setTs(k,srv.t||Date.now()); applied++; }catch(e){}
      }
    });
    if(applied>0){
      console.log('☁️ 서버에서 내 데이터 복원: '+applied+'개');
      ['renderMyReservations','renderUsageHistory','renderCars','updateMapMarkers'].forEach(function(f){
        try{ if(typeof window[f]==='function') window[f](); }catch(e){}
      });
      try{ document.dispatchEvent(new CustomEvent('caro-sync-applied')); }catch(e){}
    }
    return applied>0;
  }).catch(function(e){ pulling=false; console.warn('☁️ 서버 복원 실패:',e&&e.code); return false; });
};

/* localStorage 쓰기를 감지해 자동으로 서버 백업 예약 */
try{
  var _set=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){
    _set.apply(this,arguments);
    try{
      if(this===window.localStorage && MIRROR_RE.test(k) && !SKIP_RE.test(k)){
        setTs(k,Date.now()); schedulePush();
      }
    }catch(e){}
  };
}catch(e){}

/* 로그인(세션 복원) 시 자동 복원 + 앱 숨김/종료 직전 마지막 백업 */
(function(){
  var t=setInterval(function(){
    if(window.FB_AUTH&&window.FB_FN&&typeof window.FB_FN.onAuthStateChanged==='function'){
      clearInterval(t);
      window.FB_FN.onAuthStateChanged(window.FB_AUTH,function(u){
        if(u) setTimeout(function(){ window.caroSyncPull(u.uid); },600);
      });
    }
  },500);
  setTimeout(function(){ clearInterval(t); },15000);
})();
document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden') push(); });
window.addEventListener('beforeunload',push);

/* ═══ 2. 안드로이드 시스템 뒤로가기 ═══
   화면(.screen.active)이 바뀔 때마다 브라우저 이력을 쌓아,
   시스템 뒤로가기 → popstate → 기존 _backMap 내비게이션이 동작하게 함. */
(function(){
  var lastScreen=null, popping=false;
  window.addEventListener('popstate',function(){ popping=true; setTimeout(function(){ popping=false; },700); });
  setInterval(function(){
    var s=document.querySelector('.screen.active');
    var cur=s?s.id:null;
    if(cur&&cur!==lastScreen){
      if(!popping&&lastScreen!==null){
        try{ history.pushState({screen:cur},'',''); }catch(e){}
      }
      lastScreen=cur;
    }
  },300);
})();

/* ═══ 3. 추가운전자 등록 (구 동승운전자) ═══ */
window.caroOpenExtraDriver=function(){
  var old=document.getElementById('caro-xdrv-ov'); if(old) old.remove();
  var saved=null;
  try{ saved=JSON.parse(localStorage.getItem('caro_extra_driver')||'null'); }catch(e){}
  var ov=document.createElement('div');
  ov.id='caro-xdrv-ov';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  ov.innerHTML=
    '<div style="background:#fff;width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:22px 20px 26px;box-shadow:0 -6px 30px rgba(0,0,0,.18);font-family:inherit;">'
    +'<div style="font-size:1.05rem;font-weight:700;margin-bottom:4px;">추가운전자 등록</div>'
    +'<div style="font-size:.8rem;color:#777;margin-bottom:14px;">대여자 외 1명까지 등록할 수 있어요. 추가운전자도 면허 정보 확인이 필요합니다.</div>'
    +'<label style="font-size:.75rem;color:#555;">이름</label>'
    +'<input id="xdrv-name" style="width:100%;padding:11px;border:1px solid #ddd;border-radius:9px;margin:4px 0 10px;font-size:.9rem;" placeholder="홍길동" value="'+(saved&&saved.name?saved.name:'')+'">'
    +'<label style="font-size:.75rem;color:#555;">생년월일 (6자리)</label>'
    +'<input id="xdrv-birth" inputmode="numeric" maxlength="6" style="width:100%;padding:11px;border:1px solid #ddd;border-radius:9px;margin:4px 0 10px;font-size:.9rem;" placeholder="900101" value="'+(saved&&saved.birth?saved.birth:'')+'">'
    +'<label style="font-size:.75rem;color:#555;">운전면허번호</label>'
    +'<input id="xdrv-lic" inputmode="numeric" maxlength="15" style="width:100%;padding:11px;border:1px solid #ddd;border-radius:9px;margin:4px 0 4px;font-size:.9rem;" placeholder="12-34-567890-12" value="'+(saved&&saved.license?saved.license:'')+'">'
    +'<div style="font-size:.72rem;color:#999;margin-bottom:14px;">형식: 2-2-6-2 자리 (지역코드-연도-일련번호-체크)</div>'
    +'<div style="display:flex;gap:9px;">'
    +'<button id="xdrv-cancel" style="flex:1;padding:13px;border:1px solid #ddd;background:#fff;border-radius:10px;font-size:.9rem;">닫기</button>'
    +'<button id="xdrv-save" style="flex:2;padding:13px;border:none;background:#111;color:#fff;border-radius:10px;font-size:.9rem;font-weight:600;">등록하기</button>'
    +'</div></div>';
  document.body.appendChild(ov);
  var toast=function(m){ if(window.showToast) showToast(m); else alert(m); };
  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
  document.getElementById('xdrv-cancel').onclick=function(){ ov.remove(); };
  document.getElementById('xdrv-lic').addEventListener('input',function(){
    var v=this.value.replace(/\D/g,'').slice(0,12), out='';
    if(v.length>0) out=v.slice(0,2);
    if(v.length>2) out+='-'+v.slice(2,4);
    if(v.length>4) out+='-'+v.slice(4,10);
    if(v.length>10) out+='-'+v.slice(10,12);
    this.value=out;
  });
  document.getElementById('xdrv-save').onclick=function(){
    var name=document.getElementById('xdrv-name').value.trim();
    var birth=document.getElementById('xdrv-birth').value.trim();
    var lic=document.getElementById('xdrv-lic').value.trim();
    if(!name){ toast('이름을 입력해 주세요.'); return; }
    if(!/^\d{6}$/.test(birth)){ toast('생년월일 6자리를 입력해 주세요.'); return; }
    /* ★ 면허 진위확인 프레임 사용 (연동 전엔 형식 검증, 승인 후 자동 실검증) */
    window.caroVerifyLicense({name:name,birth:birth,license:lic}).then(function(vr){
      if(!vr.ok){ toast(vr.msg||'면허 정보를 확인해 주세요.'); return; }
      var data={name:name,birth:birth,license:lic,verified:!!vr.verified,pendingVerify:!!vr.pending,at:Date.now()};
      try{ localStorage.setItem('caro_extra_driver',JSON.stringify(data)); }catch(e){}
      try{
        var u=uid();
        if(u&&fbOK()){
          window.FB_FN.setDoc(window.FB_FN.doc(window.FB_DB,'users',u),{extraDriver:data},{merge:true});
        }
      }catch(e){}
      ov.remove();
      toast(vr.verified?'✅ 추가운전자 등록 완료 — 진위확인 완료':'✅ 추가운전자 등록 완료 — '+(vr.msg||'형식 확인됨'));
    });
  };
};

/* ═══ 3.5 '뒤로' 글씨 버튼 — 화면 맨 아래 고정 ═══ */
(function(){
  var RE=/^(←\s*)?(뒤로(가기)?|back)$/i;
  function dock(){
    try{
      document.querySelectorAll('button').forEach(function(b){
        if(b.classList.contains('caro-back-dock')) return;
        if(b.closest('#caro-mr-ov,#caro-mrd-ov')) return; /* 월렌트는 이미 정상 */
        var t=(b.textContent||'').replace(/\s+/g,' ').trim();
        if(!RE.test(t)) return;
        b.classList.add('caro-back-dock');
        var scr=b.closest('.screen');
        if(scr && !scr.dataset.caroBackPad){ scr.dataset.caroBackPad='1'; scr.style.paddingBottom='72px'; }
      });
    }catch(e){}
  }
  dock();
  document.addEventListener('DOMContentLoaded',dock);
  setInterval(dock,1200);
})();

/* ═══ 4. 운전면허 진위확인 프레임 ═══
   지금은 '형식 검증'만 수행. 기관(도로교통공단 등) API 사용 허가가 나면
   아래 CARO_LICENSE_API 세 값만 채우면 실제 진위확인이 자동 활성화됨. */
window.CARO_LICENSE_API={
  enabled:false,   /* ★ 허가 후 true 로 변경 */
  endpoint:'',     /* ★ 승인받은 진위확인 API 주소 */
  apiKey:''        /* ★ 발급받은 API 키 */
};
window.caroVerifyLicense=function(o){
  o=o||{};
  var lic=String(o.license||'').trim();
  var name=String(o.name||'').trim();
  var birth=String(o.birth||'').trim();
  /* 1단계: 형식 검증 (2-2-6-2) */
  if(!/^\d{2}-\d{2}-\d{6}-\d{2}$/.test(lic)){
    return Promise.resolve({ok:false, verified:false, reason:'format', msg:'면허번호 형식이 올바르지 않습니다. (예: 12-34-567890-12)'});
  }
  var api=window.CARO_LICENSE_API;
  /* 2단계: 기관 연동 전 — 형식 확인만 하고 '대기' 상태로 통과 */
  if(!api.enabled||!api.endpoint){
    return Promise.resolve({ok:true, verified:false, pending:true, msg:'면허 형식 확인 완료 · 기관 진위확인은 연동 승인 후 자동 적용됩니다.'});
  }
  /* 3단계: 기관 연동 후 — 실제 진위확인 호출 */
  return fetch(api.endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.apiKey},
    body:JSON.stringify({name:name,birth:birth,licenseNo:lic})
  }).then(function(r){ return r.json(); })
    .then(function(d){
      var okRes=!!(d&&(d.valid===true||d.result==='VALID'||d.status==='valid'));
      return okRes
        ? {ok:true, verified:true, msg:'✅ 면허 진위확인 완료'}
        : {ok:false, verified:false, reason:'invalid', msg:'면허 진위확인에 실패했습니다. 정보를 다시 확인해 주세요.'};
    })
    .catch(function(){ return {ok:true, verified:false, pending:true, msg:'진위확인 서버에 연결하지 못했습니다. 형식 확인만 완료된 상태로 저장합니다.'}; });
};

console.log('🔧 CARO SYNC FIX v1 로드됨 — 데이터 영속화·뒤로가기·추가운전자·면허검증 활성');
})();
