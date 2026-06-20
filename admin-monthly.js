/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 '월 렌트' 전용 탭 v1
   ───────────────────────────────────────────────────────────
   · 상단 탭에 '월 렌트' 추가 (CARO THE BLACK 옆)
   · 차량별 월 요금 설정/수정 → Firestore(cars/bl_cars) monthlyPrice 저장
   · 설정한 금액이 고객 앱 월 렌트 화면에 그대로 표시됨
   적용: admin.html </body> 위, admin-cars.js 줄 다음에
     <script src="admin-monthly.js?v=1"></script>
   ※ cars / bl_cars 규칙 이미 있음 — 추가 규칙 불필요
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function T(m){ try{ if(window.toast) toast(m); }catch(e){} }
  function num(x){ return (typeof x==='number'&&!isNaN(x))?x:null; }
  function esc(s){ return (''+(s==null?'':s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function won(n){ return (Number(n)||0).toLocaleString(); }

  var HIDE=['dash','price','resv','notice','set','black','monthly'];

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    '.mr-page-hd{margin-bottom:16px;}'
    +'.mr-ttl{font-size:22px;color:var(--txt);letter-spacing:.01em;}'
    +'.mr-sub{font-size:12px;color:var(--muted);margin-top:6px;}'
    +'.mr-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}'
    +'.mr-kpi{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px 12px;text-align:center;}'
    +'.mr-kpi .n{font-size:24px;font-family:"Saira",sans-serif;color:var(--gold-soft);font-variant-numeric:tabular-nums;line-height:1;}'
    +'.mr-kpi .l{font-size:12px;color:var(--muted);margin-top:7px;}'
    +'.mr-tbl{width:100%;border-collapse:collapse;font-size:13px;}'
    +'.mr-tbl th{text-align:left;padding:11px 14px;color:var(--muted);font-weight:500;font-size:11.5px;border-bottom:1px solid var(--border);white-space:nowrap;}'
    +'.mr-tbl td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.035);white-space:nowrap;vertical-align:middle;text-align:left;}'
    +'.mr-tbl tr:last-child td{border-bottom:none;}'
    +'.mr-grade{font-size:11px;padding:2px 9px;border-radius:20px;border:1px solid var(--border2);color:var(--muted);}'
    +'.mr-grade.bl{color:var(--gold-soft);border-color:rgba(200,169,110,.4);}'
    +'.mr-input{width:120px;background:var(--panel2);border:1px solid var(--border2);color:var(--txt);'
    +'border-radius:8px;padding:8px 10px;font-size:13px;font-family:"Saira",sans-serif;box-sizing:border-box;}'
    +'.mr-input:focus{outline:none;border-color:var(--gold-dim);}'
    +'.mr-unit{color:var(--muted);font-size:12px;margin-left:5px;}'
    +'.mr-save{background:var(--gold-soft,#c8a96e);color:#1a1813;border:none;border-radius:8px;padding:8px 15px;font-size:12px;font-weight:700;cursor:pointer;}'
    +'.mr-save:hover{opacity:.92;}'
    +'.mr-empty{padding:34px;text-align:center;color:var(--muted);font-size:13px;}';
  document.head.appendChild(st);

  /* ── 탭 전환 ── */
  function showMonthly(){
    document.querySelectorAll('.tabs .tab').forEach(function(x){ x.classList.remove('active'); });
    var b=document.querySelector('.tabs [data-tab="monthly"]'); if(b) b.classList.add('active');
    HIDE.forEach(function(id){ if(id!=='monthly'){ var el=document.getElementById('tab-'+id); if(el) el.classList.add('hide'); } });
    var s=document.getElementById('tab-monthly'); if(s) s.classList.remove('hide');
  }

  /* ── 탭 + 섹션 장착 ── */
  function mount(){
    if(document.getElementById('tab-monthly')) return;
    var dash=document.getElementById('tab-dash');
    var tabs=document.querySelector('.tabs');
    if(!dash || !tabs) return;

    var section=document.createElement('section');
    section.id='tab-monthly'; section.className='hide';
    section.innerHTML=
      '<div class="mr-page-hd"><div class="mr-ttl">월 렌트 요금 관리</div>'
      +'<div class="mr-sub">차량별 월 단위 대여 요금을 설정하세요. 저장한 금액이 고객 앱 월 렌트 화면에 그대로 표시됩니다.</div></div>'
      +'<div class="mr-stats">'
        +'<div class="mr-kpi"><div class="n" id="mrTotal">0</div><div class="l">전체 차량</div></div>'
        +'<div class="mr-kpi"><div class="n" id="mrSet">0</div><div class="l">월 요금 설정됨</div></div>'
        +'<div class="mr-kpi"><div class="n" id="mrUnset">0</div><div class="l">미설정</div></div>'
      +'</div>'
      +'<div class="card"><div class="tbl-scroll"><table class="mr-tbl">'
        +'<thead><tr><th>차량</th><th>등급</th><th>시간당 요금</th><th>월 요금</th><th style="text-align:right">저장</th></tr></thead>'
        +'<tbody id="mrBody"></tbody></table></div></div>';
    dash.parentNode.insertBefore(section, dash.nextSibling);

    /* 탭 버튼: CARO THE BLACK 옆 (없으면 대시보드 옆) */
    var anchor=document.querySelector('.tabs [data-tab="black"]') || document.querySelector('.tabs [data-tab="dash"]');
    var btn=document.createElement('button');
    btn.className='tab'; btn.setAttribute('data-tab','monthly'); btn.textContent='월 렌트';
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    btn.addEventListener('click', showMonthly);

    /* 다른 탭 누르면 월렌트 숨김 */
    document.querySelectorAll('.tabs .tab').forEach(function(t){
      if(t.getAttribute('data-tab')!=='monthly'){
        t.addEventListener('click', function(){
          var s=document.getElementById('tab-monthly'); if(s) s.classList.add('hide');
          var mb=document.querySelector('.tabs [data-tab="monthly"]'); if(mb) mb.classList.remove('active');
        });
      }
    });
  }

  /* ── 저장 ── */
  window.saveMonthlyRow=function(btn,col,id){
    if(!ready()){ T('연결 대기 중'); return; }
    var row=btn.closest('tr'); var inp=row&&row.querySelector('.mr-input'); if(!inp) return;
    var raw=(inp.value||'').replace(/[^0-9]/g,'');
    var v=raw===''?null:parseInt(raw,10);
    var FN=window.FB_FN, db=window.FB_DB;
    FN.setDoc(FN.doc(db,col,id), {monthlyPrice:v}, {merge:true})
      .then(function(){ T(v==null?'월 요금이 비워졌습니다':'월 요금 '+won(v)+'원 저장됨'); })
      .catch(function(e){ console.error('[월렌트] 저장 실패',e); T('저장 실패 — 권한 확인'); });
  };

  /* ── 렌더 ── */
  var carsArr=[], blArr=[];
  function focusedEditing(){ var a=document.activeElement; return a && a.classList && a.classList.contains('mr-input'); }
  function render(){
    mount();
    var body=document.getElementById('mrBody'); if(!body) return;
    if(focusedEditing()) return; /* 입력 중이면 갱신 보류 */
    var list=[];
    blArr.forEach(function(c){ list.push({col:'bl_cars', id:c.id, d:c.d, bl:true}); });
    carsArr.forEach(function(c){ list.push({col:'cars', id:c.id, d:c.d, bl:false}); });
    var total=list.length, setN=0;
    var rows=list.map(function(it){
      var d=it.d||{};
      var name=d.name||d.carName||d.title||'(이름 없음)';
      var ph=num(d.pricePerHour)!=null?num(d.pricePerHour):num(d.price);
      var mp=num(d.monthlyPrice);
      if(mp!=null) setN++;
      var idArg=(''+it.id).replace(/\\/g,'').replace(/'/g,"\\'");
      return '<tr>'
        +'<td style="color:var(--txt)">'+esc(name)+'</td>'
        +'<td><span class="mr-grade'+(it.bl?' bl':'')+'">'+(it.bl?'THE BLACK':'일반')+'</span></td>'
        +'<td style="color:var(--muted);font-family:\'Saira\',sans-serif">'+(ph==null?'—':won(ph)+'원/h')+'</td>'
        +'<td><input class="mr-input" type="text" value="'+(mp==null?'':mp)+'" placeholder="미설정"/><span class="mr-unit">원</span></td>'
        +'<td style="text-align:right"><button class="mr-save" onclick="saveMonthlyRow(this,\''+it.col+'\',\''+idArg+'\')">저장</button></td>'
      +'</tr>';
    }).join('');
    body.innerHTML = rows || '<tr><td colspan="5" class="mr-empty">등록된 차량이 없습니다.</td></tr>';
    var set=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('mrTotal',total); set('mrSet',setN); set('mrUnset',total-setN);
  }

  /* ── 실시간 연결 ── */
  function start(){
    mount();
    if(!ready()){ render(); return false; }
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'cars'), function(snap){
        carsArr=[]; snap.forEach(function(doc){ carsArr.push({id:doc.id, d:doc.data()||{}}); });
        carsArr.sort(function(x,y){ return (x.d.name||'').localeCompare(y.d.name||''); });
        render();
      }, function(e){ console.warn('[월렌트] cars 오류',e); });
      FN.onSnapshot(FN.collection(db,'bl_cars'), function(snap){
        blArr=[]; snap.forEach(function(doc){ blArr.push({id:doc.id, d:doc.data()||{}}); });
        blArr.sort(function(x,y){ return (x.d.name||'').localeCompare(y.d.name||''); });
        render();
      }, function(e){ console.warn('[월렌트] bl_cars 오류',e); });
    }catch(e){ console.warn('[월렌트] 리스너 오류',e); }
    return true;
  }
  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[월렌트] ✅ 관리자 월 렌트 탭 v1 활성화');
})();
