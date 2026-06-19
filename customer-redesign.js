/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 고객 앱 디자인 현대화 v2 (홈 전체 적용)
   ───────────────────────────────────────────────────────────
   · 컨셉: 잉크 블랙 + 실버 글래스 + 메탈 골드 포인트
   · 이모지 전부 제거 → 라인 아이콘
   · 프리미엄 히어로 / 글래스 타일 / 골드 THE BLACK / 하단 탭바
   · 기존 구조·onclick·기능은 그대로, 스타일만 덮어씀(안전)
   적용: index.html </body> 위, customer-monthly.js 줄 다음:
     <script src="customer-redesign.js?v=2"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var ICON_CAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l1.7-4.4A2.5 2.5 0 018 7h8a2.5 2.5 0 012.3 1.6L20 13"/><path d="M3.5 13h17v4.2a.8.8 0 01-.8.8H18a2 2 0 01-4 0h-4a2 2 0 01-4 0H4.3a.8.8 0 01-.8-.8V13z"/><circle cx="7.6" cy="15" r="1.05"/><circle cx="16.4" cy="15" r="1.05"/></svg>';
  var ICON_RESV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/><path d="M8.4 14.2l2.2 2.2L15 12"/></svg>';
  var ICON_HOME='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/></svg>';
  var ICON_MENU='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  var st=document.createElement('style');
  st.textContent=
    /* ── 워드마크 ── */
    '#home-screen .home-brand{font-family:var(--font-brand);letter-spacing:.12em;font-weight:600;color:var(--accent);}'
    /* ── 히어로 ── */
    +'#home-screen .home-welcome-banner{position:relative;overflow:hidden;'
    +'background:linear-gradient(155deg,#262a33 0%,#15161b 72%);border-radius:24px;padding:24px 22px;'
    +'box-shadow:0 18px 38px -22px rgba(20,22,28,.6);}'
    +'#home-screen .home-welcome-banner::before{content:"";position:absolute;right:-40px;top:-54px;'
    +'width:175px;height:175px;border-radius:50%;background:radial-gradient(circle,rgba(198,164,104,.30),transparent 70%);pointer-events:none;}'
    +'#home-screen .home-welcome-name{font-family:var(--font);font-size:1.06rem;font-weight:700;letter-spacing:-.01em;color:#fff;}'
    +'#home-screen .home-welcome-sub{color:rgba(200,206,218,.8);}'
    +'#home-screen .home-welcome-icon{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.92);}'
    +'#home-screen .home-welcome-icon svg{width:36px;height:36px;}'
    /* ── 그리드 카드 ── */
    +'#home-screen .hg-big,#home-screen .hg-small{background:var(--glass2);border:1px solid var(--border-l);'
    +'border-radius:20px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 1px 2px rgba(24,25,28,.04);}'
    +'#home-screen .hg-icon{display:flex;align-items:center;justify-content:center;}'
    +'#home-screen .hg-big .hg-icon svg{width:44px;height:44px;color:var(--accent);}'
    +'#home-screen .hg-small .hg-icon svg{width:30px;height:30px;color:var(--accent);}'
    +'#home-screen .hg-label{font-weight:700;letter-spacing:-.01em;color:var(--text-1);}'
    /* ── THE BLACK ── */
    +'#home-screen .hg-small.black-card{background:linear-gradient(135deg,#20232b,#14151a);'
    +'border:1px solid rgba(198,164,104,.32);}'
    +'#home-screen .hg-label-en{font-family:var(--font-brand);letter-spacing:.15em;font-weight:600;color:#fff;}'
    /* ── 섹션 제목 ── */
    +'#home-screen .home-section-title{font-weight:700;letter-spacing:-.01em;color:var(--text-1);font-size:1.04rem;}'
    /* ── 이벤트 배지 골드 ── */
    +'#home-screen .slide-badge{background:linear-gradient(135deg,#e3cd92,#c6a468)!important;color:#1c1607!important;}'
    /* ── 공지 ── */
    +'#home-screen .home-notice-list{background:var(--glass2);border:1px solid var(--border-l);border-radius:18px;overflow:hidden;}'
    +'#home-screen .home-notice-item{border-bottom:1px solid var(--border-l);}'
    +'#home-screen .notice-tag{background:rgba(140,148,160,.18);color:var(--text-2);font-weight:700;}'
    +'#home-screen .notice-tag.new-tag{background:linear-gradient(135deg,#e3cd92,#c6a468);color:#1c1607;}'
    /* ── 하단 탭바 ── */
    +'#home-screen .home-body{padding-bottom:92px;}'
    +'.caro-tabbar{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-around;align-items:center;'
    +'padding:9px 14px calc(12px + var(--sab));background:rgba(243,245,249,.9);backdrop-filter:blur(16px);'
    +'-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--border-l);z-index:60;}'
    +'.caro-tab{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10.5px;color:var(--text-m);'
    +'background:none;border:none;font-family:inherit;cursor:pointer;padding:4px 10px;letter-spacing:-.01em;}'
    +'.caro-tab.on{color:var(--accent);font-weight:600;}'
    +'.caro-tab svg{width:23px;height:23px;}';
  document.head.appendChild(st);

  function stripEmoji(s){
    try{ return (s||'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\uFE0F\u200D]/gu,'').replace(/\s{2,}/g,' ').trim(); }
    catch(e){ return s; }
  }
  function setIcon(el, svg){ if(!el) return; if(el.querySelector && el.querySelector('svg')) return; el.innerHTML=svg; }

  function clean(){
    setIcon(document.querySelector('#home-screen .hg-big .hg-icon'), ICON_CAR);
    setIcon(document.querySelector('#home-screen .hg-bottom .hg-icon'), ICON_RESV);
    setIcon(document.querySelector('#home-screen .home-welcome-icon'), ICON_CAR);
    var wn=document.getElementById('home-welcome-name');
    if(wn){ var t=stripEmoji(wn.textContent); if(t!==wn.textContent) wn.textContent=t; }
    document.querySelectorAll('#home-screen .home-section-title').forEach(function(el){
      var t=stripEmoji(el.textContent); if(t!==el.textContent) el.textContent=t;
    });
  }

  function addTabbar(){
    var home=document.getElementById('home-screen');
    if(!home || document.getElementById('caroTabbar')) return;
    var bar=document.createElement('div');
    bar.id='caroTabbar'; bar.className='caro-tabbar';
    function tab(on,svg,label,fn){
      var b=document.createElement('button'); b.className='caro-tab'+(on?' on':'');
      b.innerHTML=svg+'<span>'+label+'</span>'; b.onclick=fn; return b;
    }
    bar.appendChild(tab(true, ICON_HOME,'홈', function(){ if(window.goTo) goTo('home-screen'); }));
    bar.appendChild(tab(false,ICON_CAR,'예약', function(){ if(window.goTo) goTo('rental-screen'); }));
    bar.appendChild(tab(false,ICON_RESV,'내 예약', function(){ if(window.goTo) goTo('my-reservation-screen'); }));
    bar.appendChild(tab(false,ICON_MENU,'메뉴', function(){ if(window.openHomeMenu) openHomeMenu(); }));
    home.appendChild(bar);
  }

  function boot(){
    clean(); addTabbar();
    var home=document.getElementById('home-screen');
    if(home && window.MutationObserver){
      var pend=false;
      new MutationObserver(function(){
        if(pend) return; pend=true;
        requestAnimationFrame(function(){ pend=false; clean(); });
      }).observe(home,{childList:true,subtree:true,characterData:true});
    }
    console.log('[디자인] ✅ 홈 현대화 v2 (프리미엄 톤 적용)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
