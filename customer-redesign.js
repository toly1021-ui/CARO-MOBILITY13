/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 고객 앱 홈 리디자인 v5
   ───────────────────────────────────────────────────────────
   · 색상: 골드 버전 복귀 (첫 번째 시안 톤)
   · 하단 탭바: body로 분리 + position:fixed → 화면에 진짜 고정
     (홈 화면이 active일 때만 표시. 스크롤 따라다니던 버그 해결)
   · 이벤트/공지는 원래 색 유지 (골드 강제 안 함)
   적용: index.html — customer-monthly.js 줄 다음:
     <script src="customer-redesign.js?v=5"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var ICON_CAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l1.7-4.4A2.5 2.5 0 018 7h8a2.5 2.5 0 012.3 1.6L20 13"/><path d="M3.5 13h17v4.2a.8.8 0 01-.8.8H18a2 2 0 01-4 0h-4a2 2 0 01-4 0H4.3a.8.8 0 01-.8-.8V13z"/><circle cx="7.6" cy="15" r="1.05"/><circle cx="16.4" cy="15" r="1.05"/></svg>';
  var ICON_RESV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/><path d="M8.4 14.2l2.2 2.2L15 12"/></svg>';
  var ICON_HOME='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/></svg>';
  var ICON_USER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></svg>';
  var ICON_ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CAR_ART='<svg class="caro-hero-car" viewBox="0 0 200 110" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 70l14-30a14 14 0 0113-9h66a14 14 0 0113 8l16 31"/><path d="M10 70h170v22a5 5 0 01-5 5h-12a13 13 0 01-26 0H53a13 13 0 01-26 0H15a5 5 0 01-5-5V70z"/><circle cx="40" cy="85" r="8"/><circle cx="148" cy="85" r="8"/></svg>';

  var st=document.createElement('style');
  st.textContent=
    '#home-screen .home-brand{font-family:var(--font-brand);letter-spacing:.12em;font-weight:600;color:var(--accent);}'
    /* 히어로 — 골드 */
    +'#home-screen .home-welcome-banner.caro-hero{position:relative;overflow:hidden;color:#fff;display:block;'
    +'background:linear-gradient(155deg,#262a33 0%,#15161b 70%);border-radius:24px;padding:26px 24px 24px;'
    +'box-shadow:0 18px 40px -22px rgba(20,22,28,.7);}'
    +'.caro-hero-glow{position:absolute;right:-40px;top:-52px;width:172px;height:172px;border-radius:50%;'
    +'background:radial-gradient(circle,rgba(198,164,104,.32),transparent 70%);pointer-events:none;}'
    +'.caro-hero-car{position:absolute;right:-26px;bottom:-18px;width:188px;height:108px;opacity:.16;color:#fff;}'
    +'#home-screen .caro-hero-ey{font-size:.85rem;color:#a7adba;margin-bottom:14px;position:relative;z-index:1;font-weight:500;}'
    +'.caro-hero-h{font-size:1.9rem;font-weight:800;line-height:1.18;letter-spacing:-.02em;color:#fff;position:relative;z-index:1;}'
    +'.caro-hero-h .g{color:#e3cd92;}'
    +'.caro-hero-cta{display:inline-flex;align-items:center;gap:9px;margin-top:20px;position:relative;z-index:1;'
    +'background:linear-gradient(135deg,#e3cd92,#c6a468);color:#1c1607;font-weight:700;font-size:.96rem;'
    +'padding:13px 20px;border-radius:14px;border:none;font-family:inherit;cursor:pointer;'
    +'box-shadow:0 8px 18px -8px rgba(198,164,104,.7);}'
    +'.caro-hero-cta svg{width:18px;height:18px;}'
    /* 액션 */
    +'#home-screen .home-grid-layout.caro-actions{display:flex;flex-direction:column;gap:12px;}'
    +'.caro-black-row{display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:20px;color:#efe7d4;'
    +'background:linear-gradient(135deg,#20232b,#14151a);border:1px solid rgba(198,164,104,.32);'
    +'width:100%;font-family:inherit;cursor:pointer;text-align:left;}'
    +'.caro-black-row .cb-dia{color:#c6a468;font-size:.85rem;flex-shrink:0;}'
    +'.caro-black-row .cb-txt{display:flex;flex-direction:column;min-width:0;}'
    +'.caro-black-row .cb-t{font-family:var(--font-brand);letter-spacing:.15em;font-weight:600;font-size:.92rem;color:#fff;}'
    +'.caro-black-row .cb-s{font-size:.72rem;color:#9a958c;margin-top:3px;}'
    +'.caro-black-row .cb-arr{margin-left:auto;color:#c6a468;display:flex;flex-shrink:0;}'
    +'.caro-black-row .cb-arr svg{width:20px;height:20px;}'
    +'.caro-tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px;}'
    +'.caro-tile{background:var(--glass2);border:1px solid var(--border-l);border-radius:20px;padding:18px 16px;'
    +'display:flex;flex-direction:column;gap:13px;align-items:flex-start;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);'
    +'font-family:inherit;cursor:pointer;text-align:left;min-height:122px;}'
    +'.caro-tile .ct-ic{width:40px;height:40px;border-radius:12px;background:var(--accent);'
    +'display:flex;align-items:center;justify-content:center;color:#fff;}'
    +'.caro-tile .ct-ic svg{width:22px;height:22px;}'
    +'.caro-tile .ct-l{font-size:.96rem;font-weight:700;color:var(--text-1);letter-spacing:-.01em;}'
    +'.caro-tile .ct-s{font-size:.72rem;color:var(--text-m);margin-top:-7px;}'
    +'#monthlyRentBtn{display:none!important;}'
    +'#home-screen .home-section-title{font-weight:700;letter-spacing:-.01em;color:var(--text-1);font-size:1.04rem;}'
    +'#home-screen .home-notice-list{background:var(--glass2);border:1px solid var(--border-l);border-radius:18px;overflow:hidden;}'
    /* 하단 탭바 — body 고정 */
    +'#home-screen .home-body{padding-bottom:98px;}'
    +'#caroTabbar{position:fixed;left:0;right:0;bottom:0;display:flex;justify-content:space-around;align-items:center;'
    +'padding:9px 12px calc(12px + var(--sab));background:rgba(243,245,249,.96);backdrop-filter:blur(16px);'
    +'-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--border-l);z-index:500;}'
    +'.caro-tab{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10.5px;color:var(--text-m);'
    +'background:none;border:none;font-family:inherit;cursor:pointer;padding:4px 10px;letter-spacing:-.01em;}'
    +'.caro-tab.on{color:var(--accent);font-weight:600;}'
    +'.caro-tab svg{width:23px;height:23px;}';
  document.head.appendChild(st);

  function stripEmoji(s){
    try{ return (s||'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\uFE0F\u200D]/gu,'').replace(/\s{2,}/g,' ').trim(); }
    catch(e){ return s; }
  }
  function buildHero(){
    var b=document.querySelector('#home-screen .home-welcome-banner');
    if(!b || b.dataset.caro) return;
    var old=document.getElementById('home-welcome-name');
    var greet=old?stripEmoji(old.textContent):'';
    b.dataset.caro='1'; b.classList.add('caro-hero');
    b.innerHTML='<div class="caro-hero-glow"></div>'+CAR_ART
      +'<div class="caro-hero-ey" id="home-welcome-name">'+greet+'</div>'
      +'<div class="caro-hero-h">어디로<br><span class="g">떠나볼까요?</span></div>'
      +'<button class="caro-hero-cta" onclick="goTo(\'rental-screen\')">차량 예약하기 '+ICON_ARROW+'</button>';
  }
  function buildActions(){
    var g=document.querySelector('#home-screen .home-grid-layout');
    if(!g || g.dataset.caro) return;
    g.dataset.caro='1'; g.classList.add('caro-actions');
    g.innerHTML='<button class="caro-black-row" onclick="goBlackLabel()">'
      +'<span class="cb-dia">◆</span>'
      +'<span class="cb-txt"><span class="cb-t">CARO THE BLACK</span>'
      +'<span class="cb-s">프리미엄 차량 · 전담 컨시어지</span></span>'
      +'<span class="cb-arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span></button>'
      +'<div class="caro-tiles">'
      +'<button class="caro-tile" onclick="goTo(\'my-reservation-screen\')"><span class="ct-ic">'+ICON_RESV+'</span><span class="ct-l">예약 확인</span></button>'
      +'<button class="caro-tile" onclick="if(window.openMonthly)openMonthly()"><span class="ct-ic">'+ICON_CAR+'</span><span class="ct-l">월 렌트</span><span class="ct-s">한 달 단위 대여</span></button>'
      +'</div>';
  }
  function cleanTitles(){
    document.querySelectorAll('#home-screen .home-section-title').forEach(function(el){
      var t=stripEmoji(el.textContent); if(t!==el.textContent) el.textContent=t;
    });
    var ey=document.getElementById('home-welcome-name');
    if(ey){ var t=stripEmoji(ey.textContent); if(t!==ey.textContent) ey.textContent=t; }
  }
  function addTabbar(){
    if(document.getElementById('caroTabbar')) return;
    var bar=document.createElement('div'); bar.id='caroTabbar';
    function tab(on,svg,label,fn){ var x=document.createElement('button'); x.className='caro-tab'+(on?' on':'');
      x.innerHTML=svg+'<span>'+label+'</span>'; x.onclick=fn; return x; }
    bar.appendChild(tab(true,ICON_HOME,'홈',function(){ if(window.goTo)goTo('home-screen'); }));
    bar.appendChild(tab(false,ICON_CAR,'예약',function(){ if(window.goTo)goTo('rental-screen'); }));
    bar.appendChild(tab(false,ICON_RESV,'내 예약',function(){ if(window.goTo)goTo('my-reservation-screen'); }));
    bar.appendChild(tab(false,ICON_USER,'메뉴',function(){ if(window.openHomeMenu)openHomeMenu(); }));
    document.body.appendChild(bar);   /* 화면 영역 밖 → 진짜 고정 */
    var home=document.getElementById('home-screen');
    function sync(){ bar.style.display=(home && home.classList.contains('active'))?'flex':'none'; }
    sync();
    if(home && window.MutationObserver){
      new MutationObserver(sync).observe(home,{attributes:true,attributeFilter:['class']});
    }
  }
  function apply(){ buildHero(); buildActions(); cleanTitles(); addTabbar(); }
  function boot(){
    apply();
    var home=document.getElementById('home-screen');
    if(home && window.MutationObserver){
      var pend=false;
      new MutationObserver(function(){ if(pend) return; pend=true;
        requestAnimationFrame(function(){ pend=false; apply(); }); }).observe(home,{childList:true,subtree:true,characterData:true});
    }
    console.log('[디자인] ✅ 홈 리디자인 v5 (골드 + 탭바 body고정)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
