/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 계정 관리 v1
   ───────────────────────────────────────────────────────────
   · "+ 계정" 버튼 → 계정 추가 모달
   · 계정별 접근 권한 부여: 요금 관리 / 예약 관리 / 설정 관리
   · Firestore(admin_accounts)에 저장 → 새로고침해도 유지
   · 계정 카드 ↔ 시스템 카드 높이 동일하게
   적용: admin.html </body> 위, admin-settings.js 줄 다음에
     <script src="admin-accounts.js?v=1"></script>
   ※ Firestore 규칙 추가 필요(아래 안내 참고): admin_accounts
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function T(m){ try{ if(window.toast) toast(m); }catch(e){} }

  /* ── 권한 정의 ── */
  var PERMS=[
    {key:'price', label:'요금 관리', sub:'요금표 조회·수정'},
    {key:'resv',  label:'예약 관리', sub:'예약 내역 조회·처리'},
    {key:'set',   label:'설정 관리', sub:'시스템·계정 설정'}
  ];

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    /* 두 카드 높이 맞춤 */
    '#tab-set .grid{align-items:stretch;}'
    +'#tab-set .card{height:100%;display:flex;flex-direction:column;}'
    +'#tab-set .card .panel-body{flex:1;}'
    /* 계정 항목 */
    +'.acct2{display:flex;align-items:flex-start;gap:11px;padding:12px 13px;border:1px solid var(--border);'
    +'border-radius:11px;margin-bottom:9px;background:var(--panel2);}'
    +'.acct2 .av{width:30px;height:30px;border-radius:8px;background:#2a2516;color:var(--gold);'
    +'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}'
    +'.acct2-info{flex:1;min-width:0;}'
    +'.acct2-name{font-size:13.5px;color:var(--txt);}'
    +'.acct2-role{font-size:11.5px;color:var(--muted);margin-top:2px;}'
    +'.acct2-perms{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap;}'
    +'.apill{font-size:10.5px;padding:2px 9px;border-radius:20px;border:1px solid var(--border2);white-space:nowrap;}'
    +'.apill.price{color:#d9c24a;border-color:rgba(217,194,74,.4);}'
    +'.apill.resv{color:#6aa6db;border-color:rgba(106,166,219,.4);}'
    +'.apill.set{color:#7bb89a;border-color:rgba(123,184,154,.4);}'
    +'.apill.all{color:var(--gold-soft);border-color:rgba(200,168,90,.45);}'
    +'.apill.none{color:var(--muted);}'
    +'.acct2-del{background:transparent;border:1px solid var(--border2);color:#d57a68;border-radius:8px;'
    +'padding:5px 11px;font-size:11.5px;cursor:pointer;flex-shrink:0;}'
    +'.acct2-del:hover{background:rgba(213,122,104,.12);}'
    /* 모달 */
    +'.amodal{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;align-items:center;'
    +'justify-content:center;z-index:99999;padding:16px;}'
    +'.amodal.show{display:flex;}'
    +'.abox{background:var(--panel);border:1px solid var(--border2);border-radius:16px;'
    +'width:min(440px,94vw);max-height:90vh;overflow:auto;}'
    +'.ahd{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;'
    +'border-bottom:1px solid var(--border);}'
    +'.ahd h3{margin:0;font-size:15px;color:var(--txt);}'
    +'.aclose{background:transparent;border:none;color:var(--muted);font-size:18px;cursor:pointer;line-height:1;}'
    +'.abody{padding:16px 18px 4px;}'
    +'.abody label.fld{display:block;font-size:12px;color:var(--muted);margin:13px 0 6px;}'
    +'.abody label.fld:first-child{margin-top:0;}'
    +'.abody input.txt{width:100%;background:var(--panel2);border:1px solid var(--border2);color:var(--txt);'
    +'border-radius:9px;padding:10px 12px;font-size:13px;box-sizing:border-box;}'
    +'.abody input.txt:focus{outline:none;border-color:var(--border2);}'
    +'.aperms{display:flex;flex-direction:column;gap:8px;margin-top:2px;margin-bottom:6px;}'
    +'.aperm{display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid var(--border);'
    +'border-radius:10px;background:var(--panel2);cursor:pointer;}'
    +'.aperm input{width:17px;height:17px;accent-color:#c8a85a;flex-shrink:0;cursor:pointer;}'
    +'.aperm .pt{font-size:13px;color:var(--txt);}'
    +'.aperm .ps{font-size:11px;color:var(--muted);margin-top:1px;}'
    +'.afoot{display:flex;gap:9px;justify-content:flex-end;padding:14px 18px;border-top:1px solid var(--border);}';
  document.head.appendChild(st);

  /* ── 모달 만들기 ── */
  var modal=document.createElement('div');
  modal.className='amodal'; modal.id='acctModal';
  modal.innerHTML=
    '<div class="abox">'
    +'<div class="ahd"><h3>관리자 계정 추가</h3><button class="aclose" id="acctClose">✕</button></div>'
    +'<div class="abody">'
      +'<label class="fld">계정 이름 *</label>'
      +'<input class="txt" id="acctName" placeholder="예: operator_lee" maxlength="30" />'
      +'<label class="fld">이메일 (선택)</label>'
      +'<input class="txt" id="acctEmail" placeholder="예: lee@caro.app" maxlength="60" />'
      +'<label class="fld">역할 / 직책 (선택)</label>'
      +'<input class="txt" id="acctRole" placeholder="예: 운영 매니저" maxlength="30" />'
      +'<label class="fld">접근 권한 (체크한 메뉴만 사용 가능)</label>'
      +'<div class="aperms">'
        +PERMS.map(function(p){
          return '<label class="aperm"><input type="checkbox" data-perm="'+p.key+'">'
            +'<span><div class="pt">'+p.label+'</div><div class="ps">'+p.sub+'</div></span></label>';
        }).join('')
      +'</div>'
    +'</div>'
    +'<div class="afoot"><button class="btn" id="acctCancel">취소</button>'
    +'<button class="btn gold" id="acctSave">등록</button></div>'
    +'</div>';
  document.body.appendChild(modal);

  function openModal(){
    modal.querySelector('#acctName').value='';
    modal.querySelector('#acctEmail').value='';
    modal.querySelector('#acctRole').value='';
    modal.querySelectorAll('.aperm input').forEach(function(c){ c.checked=false; });
    modal.classList.add('show');
    setTimeout(function(){ modal.querySelector('#acctName').focus(); },50);
  }
  function closeModal(){ modal.classList.remove('show'); }

  modal.querySelector('#acctClose').onclick=closeModal;
  modal.querySelector('#acctCancel').onclick=closeModal;
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });

  modal.querySelector('#acctSave').onclick=function(){
    if(!ready()){ T('Firestore 연결 대기 중입니다'); return; }
    var name=modal.querySelector('#acctName').value.trim();
    if(!name){ T('계정 이름을 입력하세요'); return; }
    var email=modal.querySelector('#acctEmail').value.trim();
    var role=modal.querySelector('#acctRole').value.trim() || '운영 담당';
    var perms={};
    modal.querySelectorAll('.aperm input').forEach(function(c){ perms[c.dataset.perm]=c.checked; });
    var FN=window.FB_FN, db=window.FB_DB;
    var refDoc;
    try{ refDoc=FN.doc(FN.collection(db,'admin_accounts')); }
    catch(e){ T('저장 오류'); return; }
    var data={ name:name, email:email, role:role, perms:perms,
      createdAt:(FN.serverTimestamp?FN.serverTimestamp():new Date().toISOString()) };
    FN.setDoc(refDoc, data).then(function(){
      T('계정이 추가되었습니다'); closeModal();
    }).catch(function(e){
      console.error('[계정] 저장 실패', e);
      T('저장 실패 — Firestore 규칙(admin_accounts)을 확인하세요');
    });
  };

  /* ── 삭제 ── */
  window.delAcct=function(id){
    if(!ready()) return;
    if(!confirm('이 계정을 삭제할까요?')) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,'admin_accounts',id)).then(function(){ T('삭제되었습니다'); })
      .catch(function(e){ console.error(e); T('삭제 실패'); });
  };

  /* ── 권한 뱃지 ── */
  function badges(p){
    var out='';
    if(p){
      if(p.price) out+='<span class="apill price">요금</span>';
      if(p.resv)  out+='<span class="apill resv">예약</span>';
      if(p.set)   out+='<span class="apill set">설정</span>';
    }
    return out || '<span class="apill none">권한 없음</span>';
  }
  function esc(s){ return (s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* ── 목록 그리기 (최고관리자 본인 + 추가된 계정들) ── */
  function superEmail(){
    try{ if(window.FB_AUTH && FB_AUTH.currentUser && FB_AUTH.currentUser.email) return FB_AUTH.currentUser.email; }catch(e){}
    return 'caro.mobility.official@gmail.com';
  }
  function render(list){
    var box=document.getElementById('acctList'); if(!box) return;
    var html=
      '<div class="acct2"><span class="av">C</span>'
      +'<div class="acct2-info"><div class="acct2-name">CAROMOBILITY</div>'
      +'<div class="acct2-role">최고관리자 · 본인 ('+esc(superEmail())+')</div>'
      +'<div class="acct2-perms"><span class="apill all">모든 권한</span></div></div></div>';
    (list||[]).forEach(function(a){
      var initial=(a.name&&a.name[0]?a.name[0]:'?').toUpperCase();
      html+='<div class="acct2"><span class="av">'+esc(initial)+'</span>'
        +'<div class="acct2-info"><div class="acct2-name">'+esc(a.name)+'</div>'
        +'<div class="acct2-role">'+esc(a.role||'운영 담당')+(a.email?' · '+esc(a.email):'')+'</div>'
        +'<div class="acct2-perms">'+badges(a.perms)+'</div></div>'
        +'<button class="acct2-del" onclick="delAcct(\''+a.id+'\')">삭제</button></div>';
    });
    box.innerHTML=html;
  }
  window.renderAccts=function(){ render(window.__caroAccts||[]); }; // 기존 호출 무력화 + 본인 표시

  /* ── +계정 버튼 연결 + 실시간 목록 ── */
  function wire(){
    // +계정 버튼
    document.querySelectorAll('#tab-set .card-hd button').forEach(function(b){
      if(/계정/.test(b.textContent)){ b.removeAttribute('onclick'); b.onclick=openModal; }
    });
    render(window.__caroAccts||[]); // 즉시 본인이라도 표시
    if(!ready()) return false;
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'admin_accounts'), function(snap){
        var arr=[]; snap.forEach(function(d){ var o=d.data()||{}; o.id=d.id; arr.push(o); });
        arr.sort(function(x,y){ return (x.name||'').localeCompare(y.name||''); });
        window.__caroAccts=arr; render(arr);
      }, function(e){ console.warn('[계정] 목록 오류', e); });
    }catch(e){ console.warn('[계정] 리스너 오류', e); }
    return true;
  }
  if(!wire()){ var t=setInterval(function(){ if(wire()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[계정] ✅ 관리자 계정 관리 v1 활성화');
})();
