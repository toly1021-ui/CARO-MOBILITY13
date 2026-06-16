/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 "설정 > 시스템" 활성화 + 레이아웃 수정 v1
   ───────────────────────────────────────────────────────────
   · 시스템 칸이 좁은 카드에서 잘려 안 보이던 문제 수정
     (표 min-width 강제 → 깔끔한 행 레이아웃으로 교체)
   · 등록 차량 / 연결 기기(IoT) 수를 Firestore 실시간 값으로 표시
   적용: admin.html </body> 위, admin-notices.js 줄 다음에
     <script src="admin-settings.js?v=1"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }

  /* 스타일 주입 */
  var st=document.createElement('style');
  st.textContent=
    '.sys-row{display:flex;justify-content:space-between;align-items:center;gap:14px;'
    +'padding:11px 2px;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px;}'
    +'.sys-row:last-child{border-bottom:none;}'
    +'.sys-row .k{color:var(--muted);white-space:nowrap;}'
    +'.sys-row .v{color:var(--txt);text-align:right;word-break:keep-all;line-height:1.45;}'
    +'.sys-row .v.g{color:var(--gold-soft);font-family:"Saira",sans-serif;font-variant-numeric:tabular-nums;}'
    +'#tab-set .ptable{min-width:0;}'                 /* 혹시 남은 표 안전장치 */
    +'#tab-set .grid{grid-template-columns:1fr 1fr;}'
    +'@media(max-width:900px){#tab-set .grid{grid-template-columns:1fr;}}'; /* 좁으면 세로 */
  document.head.appendChild(st);

  /* 시스템 카드의 본문 찾기 */
  function sysBody(){
    var cards=document.querySelectorAll('#tab-set .card');
    for(var i=0;i<cards.length;i++){
      var h=cards[i].querySelector('.card-hd h3');
      if(h && h.textContent.indexOf('시스템')!==-1) return cards[i].querySelector('.panel-body');
    }
    return null;
  }

  function row(k,v,gold){
    return '<div class="sys-row"><span class="k">'+k+'</span><span class="v'+(gold?' g':'')+'">'+v+'</span></div>';
  }

  var carCount=null, blCount=null, devCount=null;
  function num(n){ return n==null ? '…' : n; }
  function paint(){
    var body=sysBody(); if(!body) return;
    var totalCars=(carCount==null&&blCount==null) ? null : ((carCount||0)+(blCount||0));
    body.innerHTML=
      row('앱 버전','v3.0.0',true)+
      row('등록 차량', totalCars==null ? '…' : totalCars+'대', true)+
      row('연결 기기(IoT)', devCount==null ? '…' : (devCount>0 ? devCount+'대 연결됨' : '없음'), true)+
      row('데이터 소스','Firestore 실시간 연동')+
      row('지도 중심','37.4563, 126.7052 (인천)');
  }

  function start(){
    if(!ready()){ paint(); return false; }   /* 준비 전이라도 레이아웃은 먼저 */
    var FN=window.FB_FN, db=window.FB_DB;
    paint();
    try{
      FN.onSnapshot(FN.collection(db,'cars'),    function(s){ carCount=s.size; paint(); }, function(){});
      FN.onSnapshot(FN.collection(db,'bl_cars'), function(s){ blCount=s.size;  paint(); }, function(){});
      FN.onSnapshot(FN.collection(db,'devices'), function(s){ devCount=s.size; paint(); }, function(){ devCount=0; paint(); });
    }catch(e){ console.warn('[설정] 리스너 오류', e); }
    return true;
  }

  /* 즉시 한 번(레이아웃 잡기) + 준비되면 데이터 채우기 */
  paint();
  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[설정] ✅ 시스템 패널 활성화 + 레이아웃 수정 v1');
})();
