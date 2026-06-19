/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 고객 앱 디자인 현대화 v1 (홈)
   ───────────────────────────────────────────────────────────
   · 홈 이모지(🚘 📋 🚗 👋 🎉 📢)를 깔끔한 라인 아이콘/텍스트로 교체
   · 다국어 재적용·재렌더에도 유지되도록 MutationObserver 사용(멱등)
   적용: index.html </body> 위, customer-monthly.js 줄 다음에
     <script src="customer-redesign.js?v=1"></script>
   ※ 1단계(홈). 다른 화면은 이어서 진행.
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* 깔끔한 라인 아이콘 (currentColor 상속) */
  var ICON_CAR=
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
    +'<path d="M4 13l1.7-4.4A2.5 2.5 0 0 1 8 7h8a2.5 2.5 0 0 1 2.3 1.6L20 13"/>'
    +'<path d="M3.5 13h17v4.2a.8.8 0 0 1-.8.8H18a2 2 0 0 1-4 0h-4a2 2 0 0 1-4 0H4.3a.8.8 0 0 1-.8-.8V13z"/>'
    +'<circle cx="7.6" cy="15" r="1.05"/><circle cx="16.4" cy="15" r="1.05"/></svg>';
  var ICON_RESV=
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
    +'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/>'
    +'<path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/>'
    +'<path d="M8.4 14.2l2.2 2.2L15 12"/></svg>';

  /* 스타일 */
  var st=document.createElement('style');
  st.textContent=
    '.hg-icon{display:flex;align-items:center;justify-content:center;}'
    +'.hg-big .hg-icon svg{width:42px;height:42px;color:var(--accent);}'
    +'.hg-small .hg-icon svg{width:30px;height:30px;color:var(--accent);}'
    +'.home-welcome-icon{display:flex;align-items:center;justify-content:center;}'
    +'.home-welcome-icon svg{width:34px;height:34px;color:rgba(255,255,255,.92);}'
    /* 섹션 제목: 이모지 빠진 만큼 타이포를 살짝 또렷하게 */
    +'#home-screen .home-section-title{letter-spacing:-.01em;}';
  document.head.appendChild(st);

  /* 이모지 제거 (텍스트에서) */
  function stripEmoji(s){
    try{ return (s||'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\uFE0F\u200D]/gu,'').replace(/\s{2,}/g,' ').trim(); }
    catch(e){ return s; }
  }

  function setIcon(el, svg){
    if(!el) return;
    if(el.querySelector && el.querySelector('svg')) return; /* 이미 교체됨 → 멱등 */
    el.innerHTML=svg;
  }

  function clean(){
    /* 차량 예약 아이콘 */
    setIcon(document.querySelector('#home-screen .hg-big .hg-icon'), ICON_CAR);
    /* 예약 확인 아이콘 */
    setIcon(document.querySelector('#home-screen .hg-bottom .hg-icon'), ICON_RESV);
    /* 환영 배너 아이콘 */
    setIcon(document.querySelector('#home-screen .home-welcome-icon'), ICON_CAR);

    /* 환영 인사 👋 제거 */
    var wn=document.getElementById('home-welcome-name');
    if(wn){ var t=stripEmoji(wn.textContent); if(t!==wn.textContent) wn.textContent=t; }

    /* 섹션 제목 이모지 제거 (진행 중인 이벤트 / 공지사항) */
    document.querySelectorAll('#home-screen .home-section-title').forEach(function(el){
      var t=stripEmoji(el.textContent); if(t!==el.textContent) el.textContent=t;
    });
  }

  function boot(){
    clean();
    var home=document.getElementById('home-screen');
    if(home && window.MutationObserver){
      var pend=false;
      var ob=new MutationObserver(function(){
        if(pend) return; pend=true;
        requestAnimationFrame(function(){ pend=false; clean(); });
      });
      ob.observe(home,{childList:true,subtree:true,characterData:true});
    }
    console.log('[디자인] ✅ 홈 현대화 v1 (이모지 → 라인 아이콘)');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
