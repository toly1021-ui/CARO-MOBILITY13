/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 고객 앱 '월 렌트' v1
   ───────────────────────────────────────────────────────────
   · 홈 화면 '진행 중인 이벤트' 위에 [월 렌트] 버튼
   · 누르면 등록된 전 차량(CARS_DATA + BL_CARS)이 월 요금과 함께 표시
   · 지도 없음. 차량마다 monthlyPrice(관리자 설정) 우선, 없으면 시간요금 기반 예상치
   적용: index.html </body> 위, customer-notices.js 줄 다음에
     <script src="customer-monthly.js?v=1"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function won(n){ return (Number(n)||0).toLocaleString()+'원'; }
  function T(m){ try{ if(window.showToast) showToast(m); else if(window.toast) toast(m); else alert(m); }catch(e){} }
  function carName(c){ try{ if(window.getCarName) return getCarName(c); }catch(e){} return c.name||'차량'; }
  function monthlyOf(c){
    if(typeof c.monthlyPrice==='number' && c.monthlyPrice>0) return {v:c.monthlyPrice, est:false};
    var ph=Number(c.pricePerHour||c.price||0);
    return {v:Math.round(ph*150/10000)*10000, est:true};   /* 예상치: 시간요금×150 (관리자가 월요금 설정하면 그 값 사용) */
  }
  function esc(s){ return (''+(s==null?'':s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* ── 스타일 (라이트 테마) ── */
  var st=document.createElement('style');
  st.textContent=
    '.mrent-home-btn{display:flex;align-items:center;justify-content:space-between;width:100%;background:#fff;'
    +'border:1px solid rgba(0,0,0,.08);border-radius:16px;padding:15px 18px;margin:2px 0 18px;cursor:pointer;'
    +'box-shadow:0 2px 12px rgba(0,0,0,.05);text-align:left;transition:transform .15s,box-shadow .15s;font-family:inherit;}'
    +'.mrent-home-btn:active{transform:scale(.99);box-shadow:0 1px 6px rgba(0,0,0,.08);}'
    +'.mrent-home-t{display:block;font-size:1rem;font-weight:700;color:#18191c;letter-spacing:.01em;}'
    +'.mrent-home-s{display:block;font-size:.78rem;color:#888d98;margin-top:3px;}'
    +'.mrent-home-arrow{font-size:1.15rem;color:#888d98;font-weight:300;}'
    +'#monthly-screen{background:var(--silver-base,#eef1f5);}'
    +'.mrent-wrap{width:100%;max-width:560px;margin:0 auto;padding:0 16px 40px;box-sizing:border-box;}'
    +'.mrent-top{display:flex;align-items:center;gap:10px;padding:16px 0 6px;}'
    +'.mrent-back{width:38px;height:38px;border-radius:11px;border:1px solid rgba(0,0,0,.08);background:#fff;'
    +'font-size:1.1rem;color:#18191c;cursor:pointer;display:flex;align-items:center;justify-content:center;}'
    +'.mrent-toptitle{font-size:1rem;font-weight:700;color:#18191c;letter-spacing:.02em;}'
    +'.mrent-head{padding:12px 2px 10px;}'
    +'.mrent-h1{font-size:1.4rem;font-weight:700;color:#18191c;margin:0;letter-spacing:.01em;}'
    +'.mrent-desc{font-size:.85rem;color:#888d98;margin:7px 0 0;line-height:1.5;}'
    +'.mrent-count{font-size:.8rem;color:#888d98;margin:6px 2px 12px;}'
    +'.mrent-list{display:flex;flex-direction:column;gap:11px;}'
    +'.mrent-card{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid rgba(0,0,0,.07);'
    +'border-radius:15px;padding:13px 14px;box-shadow:0 1px 7px rgba(0,0,0,.04);}'
    +'.mrent-card.black{background:#15171c;border-color:rgba(200,169,110,.4);}'
    +'.mrent-thumb{width:84px;height:54px;border-radius:12px;object-fit:cover;flex-shrink:0;background:#f0f0f3;}'
    +'.mrent-info{flex:1;min-width:0;}'
    +'.mrent-name{font-size:.96rem;font-weight:700;color:#18191c;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}'
    +'.mrent-card.black .mrent-name{color:#f0e6d2;}'
    +'.mrent-tag{font-size:.6rem;font-weight:700;letter-spacing:.1em;color:#1a1813;'
    +'background:linear-gradient(135deg,#e0c884,#c8a96e);padding:2px 7px;border-radius:4px;}'
    +'.mrent-sub{font-size:.78rem;color:#888d98;margin-top:3px;}'
    +'.mrent-card.black .mrent-sub{color:#9a958c;}'
    +'.mrent-price{font-size:.82rem;color:#44474f;margin-top:6px;}'
    +'.mrent-price strong{font-size:1rem;color:#18191c;font-weight:800;}'
    +'.mrent-card.black .mrent-price{color:#c8a96e;} .mrent-card.black .mrent-price strong{color:#e0c884;}'
    +'.mrent-est{font-size:.62rem;color:#888d98;border:1px solid rgba(0,0,0,.12);border-radius:4px;padding:1px 5px;margin-left:5px;vertical-align:middle;}'
    +'.mrent-card.black .mrent-est{color:#9a958c;border-color:rgba(255,255,255,.18);}'
    +'.mrent-apply{flex-shrink:0;align-self:center;background:#18191c;color:#fff;border:none;border-radius:10px;'
    +'padding:9px 15px;font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit;}'
    +'.mrent-card.black .mrent-apply{background:linear-gradient(135deg,#d8be7e,#c8a96e);color:#1a1813;}'
    +'.mrent-empty{text-align:center;color:#888d98;padding:50px 20px;font-size:.9rem;}';
  document.head.appendChild(st);

  /* ── 화면 생성 ── */
  function ensureScreen(){
    if(document.getElementById('monthly-screen')) return;
    var scr=document.createElement('div');
    scr.id='monthly-screen'; scr.className='screen';
    scr.innerHTML=
      '<div class="mrent-wrap">'
      +'<div class="mrent-top"><button class="mrent-back" onclick="goTo(\'home-screen\')">←</button>'
      +'<span class="mrent-toptitle">월 렌트</span></div>'
      +'<div class="mrent-head"><h1 class="mrent-h1">월 단위 차량 대여</h1>'
      +'<p class="mrent-desc">한 달 단위로 차량을 빌려 자유롭게 이용하세요. 원하는 차량을 선택해 월 렌트를 신청할 수 있어요.</p></div>'
      +'<div class="mrent-count" id="mrentCount"></div>'
      +'<div class="mrent-list" id="monthlyCarList"></div>'
      +'</div>';
    document.body.appendChild(scr);
  }

  function card(c, isBlack){
    var m=monthlyOf(c);
    var img=c.img||c.image||'';
    var num=c.carNumber||c.plate||c.number||'';
    var fuel=c.fuel||'';
    var sub=[num,fuel].filter(Boolean).join(' · ');
    var nm=esc(carName(c));
    var nmArg=(carName(c)||'').replace(/\\/g,'').replace(/'/g,"\\'");
    return '<div class="mrent-card'+(isBlack?' black':'')+'">'
      +(img?'<img class="mrent-thumb" src="'+esc(img)+'" alt=""/>':'<div class="mrent-thumb"></div>')
      +'<div class="mrent-info">'
        +'<div class="mrent-name">'+nm+(isBlack?'<span class="mrent-tag">THE BLACK</span>':'')+'</div>'
        +(sub?'<div class="mrent-sub">'+esc(sub)+'</div>':'')
        +'<div class="mrent-price">월 <strong>'+won(m.v)+'</strong>'+(m.est?'<span class="mrent-est">예상</span>':'')+'</div>'
      +'</div>'
      +'<button class="mrent-apply" onclick="caroMonthlyApply(\''+nmArg+'\')">신청</button>'
    +'</div>';
  }

  function renderList(){
    ensureScreen();
    var box=document.getElementById('monthlyCarList'); if(!box) return;
    var cars=(window.CARS_DATA||[]); var bl=(window.BL_CARS||[]);
    var html='';
    bl.forEach(function(c){ html+=card(c,true); });
    cars.forEach(function(c){ html+=card(c,false); });
    box.innerHTML = html || '<div class="mrent-empty">등록된 차량이 없습니다.</div>';
    var cnt=document.getElementById('mrentCount');
    if(cnt) cnt.textContent='총 '+(cars.length+bl.length)+'대';
  }

  window.caroMonthlyApply=function(name){ T(name+' — 월 렌트 신청은 곧 오픈됩니다.'); };
  window.openMonthly=function(){ renderList(); if(window.goTo) goTo('monthly-screen'); };

  /* ── 홈 버튼 삽입 (진행 중인 이벤트 위) ── */
  function injectBtn(){
    if(document.getElementById('monthlyRentBtn')) return true;
    var ev=document.querySelector('#home-screen [data-i18n="event_banner_title"]');
    if(!ev) return false;
    var b=document.createElement('button');
    b.id='monthlyRentBtn'; b.className='mrent-home-btn'; b.type='button';
    b.onclick=window.openMonthly;
    b.innerHTML='<span><span class="mrent-home-t">월 렌트</span>'
      +'<span class="mrent-home-s">한 달 단위로 차량을 빌려보세요</span></span>'
      +'<span class="mrent-home-arrow">→</span>';
    ev.parentNode.insertBefore(b, ev);
    return true;
  }

  ensureScreen();
  if(!injectBtn()){ var t=setInterval(function(){ if(injectBtn()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[월렌트] ✅ 고객 월 렌트 화면 v1 활성화');
})();
