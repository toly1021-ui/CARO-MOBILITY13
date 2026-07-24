/* CARO MOBILITY 관제 — 요금 관리(성수기/주말) + 이모지 제거 v5
   admin.html </body> 위: <script src="admin-pricing.js?v=5"></script> */
(function(){
  'use strict';
  var LS='caro_pricing_cfg';
  var FALLBACK=["모닝","아반떼","쏘나타","코나","셀토스"];

  function esc(s){ s=(s==null?'':''+s); return s.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function toast(m){ try{ if(typeof window.toast==='function'){ window.toast(m); return; } if(typeof window.showToast==='function'){ window.showToast(m); return; } }catch(e){} try{ alert(m); }catch(e2){} }
  function won(n){ n=Number(n)||0; return n.toLocaleString('ko-KR'); }

  var cfg={season:'off',models:{}};
  function loadLS(){ try{ var r=localStorage.getItem(LS); if(r){ var d=JSON.parse(r); cfg={season:(d.season==='peak'?'peak':'off'), models:d.models||{}}; } }catch(e){} }
  function saveLS(){ try{ localStorage.setItem(LS, JSON.stringify(cfg)); }catch(e){} }
  function saveRemote(){ try{ var db=window.FB_DB, fn=window.FB_FN; if(db&&fn&&fn.setDoc&&fn.doc){ return fn.setDoc(fn.doc(db,'settings','pricing'),{season:cfg.season,models:cfg.models},{merge:true}); } }catch(e){} return null; }
  function loadRemote(cb){ try{ var db=window.FB_DB, fn=window.FB_FN; if(db&&fn&&fn.getDoc&&fn.doc){ fn.getDoc(fn.doc(db,'settings','pricing')).then(function(snap){ var ex=snap&&(typeof snap.exists==='function'?snap.exists():snap.exists); if(ex){ var d=(typeof snap.data==='function'?snap.data():snap.data)||{}; cfg={season:(d.season==='peak'?'peak':'off'),models:d.models||{}}; saveLS(); } cb&&cb(); }).catch(function(){ cb&&cb(); }); return; } }catch(e){} cb&&cb(); }

  var FLEET=null, BASE_RATE={};
  function addCar(o){ if(!o) return; var n=(o.name||o.model||o.carName||'').trim(); if(!n) return; if(BASE_RATE[n]==null){ var r=(o.__origRate!=null?o.__origRate:o.pricePerHour); if(r!=null) BASE_RATE[n]=r; } return n; }
  function loadFleet(cb){
    var names={};
    [window.CARS_DATA, window.BL_CARS].forEach(function(l){ (l||[]).forEach(function(c){ var n=addCar(c); if(n) names[n]=1; }); });
    function finish(){ var arr=Object.keys(names); if(!arr.length) arr=FALLBACK.slice(); FLEET=arr.sort(function(a,b){ return a.localeCompare(b,'ko'); }); cb&&cb(FLEET); }
    try{ var db=window.FB_DB, fn=window.FB_FN;
      if(db&&fn&&fn.getDocs&&fn.collection){ var grab=function(col){ return fn.getDocs(fn.collection(db,col)).then(function(s){ s.forEach(function(d){ var o=d.data()||{}; var n=addCar(o); if(n) names[n]=1; }); }).catch(function(){}); };
        Promise.all([grab('cars'),grab('bl_cars')]).then(finish); return; }
    }catch(e){}
    finish();
  }
  function baseOf(name){ return (BASE_RATE[name]!=null)?BASE_RATE[name]:null; }

  var st=document.createElement('style'); st.id='caro-pricing-css';
  st.textContent=
    '#cpx-fab{position:fixed;right:16px;bottom:16px;z-index:9998;background:linear-gradient(135deg,#c8a96e,#a5854e);color:#1a1a1a;border:none;border-radius:26px;padding:12px 18px;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4);}'
   +'#cpx-fab:active{transform:scale(.96);}'
   +'#cpx-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,10,13,.55);display:none;}'
   +'#cpx-ov.open{display:block;}'
   +'#cpx-panel{position:absolute;right:0;top:0;bottom:0;width:min(560px,100%);background:#16181d;box-shadow:-8px 0 30px rgba(0,0,0,.5);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .28s cubic-bezier(.22,1,.36,1);}'
   +'#cpx-ov.open #cpx-panel{transform:translateX(0);}'
   +'.cpx-hd{display:flex;align-items:center;gap:10px;padding:16px 16px 12px;border-bottom:1px solid #2a2d34;}'
   +'.cpx-hd h2{flex:1;font-size:1.02rem;font-weight:800;color:#f0e6d2;margin:0;}'
   +'.cpx-x{background:none;border:none;color:#9aa0aa;font-size:1.4rem;cursor:pointer;line-height:1;padding:2px 6px;}'
   +'.cpx-season{display:flex;gap:8px;padding:14px 16px 6px;}'
   +'.cpx-season-lbl{font-size:.76rem;color:#9aa0aa;align-self:center;margin-right:2px;}'
   +'.cpx-sb{flex:1;padding:11px;border-radius:11px;border:1px solid #33373f;background:#1f2228;color:#cfd3da;font-size:.9rem;font-weight:800;font-family:inherit;cursor:pointer;}'
   +'.cpx-sb.on{background:linear-gradient(135deg,#c8a96e,#a5854e);color:#17181b;border-color:transparent;}'
   +'.cpx-note{font-size:.72rem;color:#8b909a;line-height:1.55;padding:6px 16px 8px;}'
   +'.cpx-search{margin:4px 16px 8px;}'
   +'.cpx-search input{width:100%;box-sizing:border-box;background:#1f2228;border:1px solid #33373f;border-radius:10px;color:#e9eaed;font-size:.86rem;padding:9px 12px;font-family:inherit;}'
   +'.cpx-list{flex:1;overflow-y:auto;padding:0 16px 12px;}'
   +'.cpx-card{border:1px solid #2a2d34;border-radius:13px;background:#1b1e23;padding:11px 12px;margin-bottom:9px;}'
   +'.cpx-nm{font-size:.9rem;font-weight:700;color:#e9eaed;margin-bottom:2px;}'
   +'.cpx-base{font-size:.68rem;color:#8b909a;margin-bottom:8px;}'
   +'.cpx-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}'
   +'.cpx-fld label{display:block;font-size:.68rem;color:#9aa0aa;margin-bottom:3px;}'
   +'.cpx-fld .u{display:flex;align-items:center;background:#22262c;border:1px solid #363a42;border-radius:9px;padding:0 9px;}'
   +'.cpx-fld input{flex:1;width:100%;background:none;border:none;color:#f0e6d2;font-size:.86rem;font-weight:700;font-family:inherit;padding:9px 0;text-align:right;}'
   +'.cpx-fld .w{font-size:.7rem;color:#8b909a;padding-left:4px;}'
   +'.cpx-foot{padding:12px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid #2a2d34;display:flex;gap:8px;}'
   +'.cpx-save{flex:1;background:linear-gradient(135deg,#c8a96e,#a5854e);color:#17181b;border:none;border-radius:12px;padding:13px;font-size:.94rem;font-weight:800;font-family:inherit;cursor:pointer;}'
   +'.cpx-save:active{transform:scale(.99);}';
  (document.head||document.documentElement).appendChild(st);

  var ov=null;
  function fields(name){
    var m=cfg.models[name]||{}; var b=baseOf(name);
    function fld(k,lbl){ var v=(m[k]!=null?m[k]:''); return '<div class="cpx-fld"><label>'+lbl+'</label><div class="u"><input type="number" inputmode="numeric" data-nm="'+esc(name)+'" data-k="'+k+'" value="'+esc(v)+'" placeholder="'+(b!=null?won(b):'요금')+'"/><span class="w">원/h</span></div></div>'; }
    return '<div class="cpx-card" data-card="'+esc(name)+'"><div class="cpx-nm">'+esc(name)+'</div>'
      +(b!=null?'<div class="cpx-base">기본요금 '+won(b)+'원/h · 미입력 시 기본요금 적용</div>':'<div class="cpx-base">미입력 시 기본요금 적용</div>')
      +'<div class="cpx-grid">'+fld('pwd','성수기 · 평일')+fld('pwe','성수기 · 주말')+fld('owd','비성수기 · 평일')+fld('owe','비성수기 · 주말')+'</div></div>';
  }
  function renderList(filter){
    var box=ov.querySelector('.cpx-list'); if(!box) return;
    if(FLEET==null){ box.innerHTML='<div style="color:#8b909a;text-align:center;padding:30px 0;font-size:.85rem;">차량 목록 불러오는 중…</div>'; return; }
    var models=FLEET.slice();
    if(filter){ var f=filter.toLowerCase(); models=models.filter(function(n){ return n.toLowerCase().indexOf(f)>=0; }); }
    box.innerHTML=models.length?models.map(fields).join(''):'<div style="color:#8b909a;text-align:center;padding:30px 0;font-size:.85rem;">등록된 차량이 없습니다.</div>';
  }
  function syncSeasonBtns(){ var p=ov.querySelector('[data-season="peak"]'), o=ov.querySelector('[data-season="off"]'); if(p) p.classList.toggle('on',cfg.season==='peak'); if(o) o.classList.toggle('on',cfg.season!=='peak'); }
  function collect(){ var models={}; ov.querySelectorAll('.cpx-fld input').forEach(function(inp){ var nm=inp.getAttribute('data-nm'), k=inp.getAttribute('data-k'), v=parseInt(inp.value,10); if(!isNaN(v)&&v>0){ if(!models[nm]) models[nm]={}; models[nm][k]=v; } }); cfg.models=models; }
  function doSave(){ collect(); saveLS(); var pr=saveRemote(); if(pr&&pr.then){ pr.then(function(){ toast('요금 설정을 저장했습니다.'); }).catch(function(){ toast('로컬 저장 완료 (서버 저장 실패 — 네트워크/권한 확인)'); }); } else { toast('요금 설정을 저장했습니다.'); } try{ if(window.caroReloadPricing) window.caroReloadPricing(); if(window.caroApplyPricing) window.caroApplyPricing(new Date()); }catch(e){} }

  function build(){
    if(ov) return;
    ov=document.createElement('div'); ov.id='cpx-ov';
    ov.innerHTML='<div id="cpx-panel">'
      +'<div class="cpx-hd"><h2>요금 관리 · 성수기/주말</h2><button class="cpx-x" type="button" aria-label="닫기">✕</button></div>'
      +'<div class="cpx-season"><span class="cpx-season-lbl">현재 적용 시즌</span><button class="cpx-sb" type="button" data-season="peak">성수기</button><button class="cpx-sb" type="button" data-season="off">비성수기</button></div>'
      +'<div class="cpx-note">· 주말요금 자동 적용: <b>금요일 18시~ + 토·일 + 공휴일</b><br>· 동일 차종은 한 번만 입력하면 같은 차종 전체에 적용됩니다.<br>· 비워두면 해당 차종은 기존 기본요금이 적용됩니다.</div>'
      +'<div class="cpx-search"><input type="text" placeholder="차종 검색 (예: 아반떼, 코나)"/></div>'
      +'<div class="cpx-list"></div>'
      +'<div class="cpx-foot"><button class="cpx-save" type="button">저장</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    ov.querySelector('.cpx-x').onclick=close;
    ov.querySelector('.cpx-save').onclick=doSave;
    ov.querySelector('.cpx-search input').addEventListener('input', function(){ renderList(this.value.trim()); });
    ov.querySelectorAll('[data-season]').forEach(function(b){ b.onclick=function(){ cfg.season=b.getAttribute('data-season')==='peak'?'peak':'off'; syncSeasonBtns(); saveLS(); var pr=saveRemote(); if(pr&&pr.then){ pr.then(function(){ toast('현재 시즌: '+(cfg.season==='peak'?'성수기':'비성수기')); }).catch(function(){}); } else { toast('현재 시즌: '+(cfg.season==='peak'?'성수기':'비성수기')); } try{ if(window.caroReloadPricing) window.caroReloadPricing(); }catch(e){} }; });
  }
  function open(){ build(); ov.classList.add('open'); renderList(''); loadFleet(function(){ loadRemote(function(){ loadLS(); syncSeasonBtns(); renderList(''); }); }); }
  function close(){ if(ov) ov.classList.remove('open'); }
  window.caroOpenPricingAdmin=open;

  function loggedIn(){ try{ return !!(window.FB_AUTH && window.FB_AUTH.currentUser); }catch(e){ return false; } }
  function findHeaderHost(){ var els=document.querySelectorAll('h1,h2,h3,h4,h5,div,span,p,strong,b,label'); for(var i=0;i<els.length;i++){ var e=els[i]; if(e.childElementCount===0){ var tx=(e.textContent||'').trim(); if(tx==='차량별 요금 관리') return e; } } return null; }
  function wideAncestor(el){ var n=el, best=el; for(var i=0;i<8 && n && n.parentElement;i++){ n=n.parentElement; if(n.offsetWidth && n.offsetWidth>=480){ best=n; break; } } return best; }
  function positionHeaderBtn(){
    var b=document.getElementById('cpx-hdbtn'), t=findHeaderHost(); if(!b||!t) return;
    var r=t.getBoundingClientRect(), host=wideAncestor(t), cr=host.getBoundingClientRect();
    var top=r.top+window.pageYOffset+r.height/2-b.offsetHeight/2;
    var left=cr.right+window.pageXOffset-b.offsetWidth-18;
    b.style.top=Math.max(0,Math.round(top))+'px'; b.style.left=Math.max(0,Math.round(left))+'px';
  }
  function ensureHeaderBtn(){
    if(document.getElementById('cpx-hdbtn')){ positionHeaderBtn(); return true; }
    var t=findHeaderHost(); if(!t) return false;
    var b=document.createElement('button'); b.id='cpx-hdbtn'; b.type='button'; b.textContent='성수기 / 주말 요금 설정';
    b.style.cssText='position:absolute;z-index:50;white-space:nowrap;background:linear-gradient(135deg,#c8a96e,#a5854e);color:#17181b;border:none;border-radius:20px;padding:9px 17px;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);';
    b.onclick=open; document.body.appendChild(b); positionHeaderBtn();
    if(!ensureHeaderBtn.__rz){ ensureHeaderBtn.__rz=true; window.addEventListener('resize', positionHeaderBtn); window.addEventListener('scroll', positionHeaderBtn, true); }
    return true;
  }
  function ensureFab(){ if(document.getElementById('cpx-fab')) return; var b=document.createElement('button'); b.id='cpx-fab'; b.type='button'; b.textContent='요금 관리'; b.onclick=open; document.body.appendChild(b); }
  var everHd=false, tick=0;
  function place(){
    var fab=document.getElementById('cpx-fab'), hd=document.getElementById('cpx-hdbtn');
    if(!loggedIn()){ if(fab)fab.style.display='none'; if(hd)hd.remove(); if(ov)ov.classList.remove('open'); return; }
    if(ensureHeaderBtn()){ everHd=true; if(fab)fab.style.display='none'; return; }
    tick++; if(!everHd && tick>=8){ ensureFab(); var f=document.getElementById('cpx-fab'); if(f) f.style.display=''; }
  }
  function watchAuth(){ try{ var A=window.FB_AUTH, fn=window.FB_FN; if(A&&fn&&typeof fn.onAuthStateChanged==='function'&&!watchAuth.__h){ watchAuth.__h=true; fn.onAuthStateChanged(A, place); } }catch(e){} }

  var EMO=/[\u{1F000}-\u{1FAFF}]\uFE0F?|[\u{2600}-\u{26FF}]\uFE0F?|[\u{2B00}-\u{2BFF}]\uFE0F?|\u2705|\u2714\uFE0F?|\u2728|\u2733|\u2734|\u2744|\u2747|\u2753|\u2754|\u2755|\u2757|\u2763|\u2764|\u2795|\u2796|\u2797|\u2049|\u203C|\u2122|\u2139\uFE0F?|\uFE0F|\u20E3|\u200D/gu;
  function stripText(t){ if(!t||t.nodeType!==3) return; var v=t.nodeValue; if(!v) return; var nv=v.replace(EMO,''); if(nv!==v) t.nodeValue=nv.replace(/[ \t]{2,}/g,' '); }
  function stripAll(root){ try{ var w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,null,false); var n,list=[]; while(n=w.nextNode())list.push(n); list.forEach(stripText); }catch(e){} }
  function startEmoji(){ stripAll(document.body); if(startEmoji.__mo) return; try{ startEmoji.__mo=new MutationObserver(function(ms){ ms.forEach(function(m){ if(m.type==='characterData'){ stripText(m.target); } (m.addedNodes||[]).forEach(function(nn){ if(nn.nodeType===3) stripText(nn); else if(nn.nodeType===1) stripAll(nn); }); }); }); startEmoji.__mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true}); }catch(e){} }

  loadLS();
  startEmoji(); setTimeout(startEmoji,1500); setTimeout(startEmoji,4000);
  setInterval(function(){ watchAuth(); place(); }, 1000);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ startEmoji(); place(); }); else { place(); }
  console.log('[관제] 요금 관리(성수기/주말) 모듈 로드 · 이모지 제거 적용');
})();
