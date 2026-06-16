/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관제 대시보드 'CARO THE BLACK' 프리미엄 전용 섹션 v1
   ───────────────────────────────────────────────────────────
   · 대시보드 하단에 블랙(프리미엄) 차량 전용 카드 추가
   · 전용 통계(총/이용가능/이용중/점검) + 차량 목록 (bl_cars 실시간)
   · "+ 블랙 차량" 추가 모달 / 행별 삭제
   적용: admin.html </body> 위, admin-accounts.js 줄 다음에
     <script src="admin-black.js?v=1"></script>
   ※ bl_cars 규칙은 이미 있음(allow write: if isAdmin()) — 추가 규칙 불필요
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function T(m){ try{ if(window.toast) toast(m); }catch(e){} }
  function num(x){ return (typeof x==='number'&&!isNaN(x))?x:null; }
  function esc(s){ return (''+(s==null?'':s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function mapStatus(s){
    if(!s) return '이용가능'; s=(''+s).toLowerCase();
    if(s.indexOf('busy')>=0||s.indexOf('use')>=0||s.indexOf('rent')>=0||s.indexOf('이용중')>=0) return '이용중';
    if(s.indexOf('maint')>=0||s.indexOf('unavail')>=0||s.indexOf('점검')>=0||s.indexOf('off')>=0||s.indexOf('disable')>=0) return '점검';
    return '이용가능';
  }
  function stCls(st){ return st==='이용중'?'b-rent':(st==='점검'?'b-maint':'b-avail'); }
  function stLabel(st){ return st==='점검'?'점검·불가':st; }

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    '.blk-card{margin-top:16px;border:1px solid var(--gold-dim);'
    +'background:linear-gradient(160deg,rgba(200,169,110,.07),var(--panel) 55%);}'
    +'.blk-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}'
    +'.blk-hd h3{display:flex;align-items:center;gap:9px;margin:0;font-size:15px;letter-spacing:.04em;color:var(--gold-soft);}'
    +'.blk-tag{font-size:9.5px;letter-spacing:.13em;color:#1a1813;background:linear-gradient(135deg,#e0c884,#c8a96e);'
    +'padding:3px 8px;border-radius:5px;font-weight:800;}'
    +'.blk-sub{font-size:11.5px;color:var(--muted);margin-top:4px;}'
    +'.blk-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px 18px 6px;}'
    +'.blk-kpi{background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:12px;padding:13px 10px;text-align:center;}'
    +'.blk-kpi .n{font-size:23px;font-family:"Saira",sans-serif;color:var(--gold-soft);font-variant-numeric:tabular-nums;line-height:1;}'
    +'.blk-kpi .l{font-size:11px;color:var(--muted);margin-top:6px;}'
    +'.blk-tbl{width:100%;border-collapse:collapse;font-size:13px;}'
    +'.blk-tbl th{text-align:left;padding:10px 14px;color:var(--muted);font-weight:500;font-size:11.5px;border-bottom:1px solid var(--border);white-space:nowrap;}'
    +'.blk-tbl td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.035);white-space:nowrap;}'
    +'.blk-tbl tr:last-child td{border-bottom:none;}'
    +'.blk-empty{padding:26px 18px;text-align:center;color:var(--muted);font-size:13px;}'
    +'.bdot{display:inline-flex;align-items:center;gap:6px;font-size:12px;}'
    +'.bdot i{width:7px;height:7px;border-radius:50%;display:inline-block;}'
    +'.b-avail{color:#7bb89a;} .b-avail i{background:#7bb89a;}'
    +'.b-rent{color:#6aa6db;} .b-rent i{background:#6aa6db;}'
    +'.b-maint{color:#e0a86c;} .b-maint i{background:#e0a86c;}'
    +'.blk-del{background:transparent;border:1px solid var(--border2);color:#d57a68;border-radius:7px;'
    +'padding:4px 10px;font-size:11.5px;cursor:pointer;}'
    +'.blk-del:hover{background:rgba(213,122,104,.12);}'
    /* 모달 (계정 모달과 동일 톤) */
    +'.bmodal{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;align-items:center;justify-content:center;z-index:99999;padding:16px;}'
    +'.bmodal.show{display:flex;}'
    +'.bbox{background:var(--panel);border:1px solid var(--gold-dim);border-radius:16px;width:min(440px,94vw);max-height:90vh;overflow:auto;}'
    +'.bbhd{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border);}'
    +'.bbhd h3{margin:0;font-size:15px;color:var(--gold-soft);display:flex;align-items:center;gap:8px;}'
    +'.bbclose{background:transparent;border:none;color:var(--muted);font-size:18px;cursor:pointer;line-height:1;}'
    +'.bbody{padding:16px 18px 4px;}'
    +'.bbody label{display:block;font-size:12px;color:var(--muted);margin:13px 0 6px;}'
    +'.bbody label:first-child{margin-top:0;}'
    +'.bbody input,.bbody select{width:100%;background:var(--panel2);border:1px solid var(--border2);color:var(--txt);'
    +'border-radius:9px;padding:10px 12px;font-size:13px;box-sizing:border-box;}'
    +'.bbody input:focus,.bbody select:focus{outline:none;}'
    +'.bbrow{display:flex;gap:10px;}.bbrow>div{flex:1;}'
    +'.bbfoot{display:flex;gap:9px;justify-content:flex-end;padding:14px 18px;border-top:1px solid var(--border);}';
  document.head.appendChild(st);

  /* ── 섹션 만들기 ── */
  var sec=document.createElement('div');
  sec.className='card blk-card';
  sec.innerHTML=
    '<div class="card-hd blk-hd">'
      +'<div><h3>CARO THE BLACK <span class="blk-tag">PREMIUM</span></h3>'
      +'<div class="blk-sub">프리미엄 차량 전용 관리 · bl_cars 실시간</div></div>'
      +'<button class="btn gold" id="blkAddBtn">+ 블랙 차량</button>'
    +'</div>'
    +'<div class="blk-stats">'
      +'<div class="blk-kpi"><div class="n" id="blkTotal">0</div><div class="l">총 대수</div></div>'
      +'<div class="blk-kpi"><div class="n" id="blkAvail">0</div><div class="l">이용 가능</div></div>'
      +'<div class="blk-kpi"><div class="n" id="blkBusy">0</div><div class="l">이용 중</div></div>'
      +'<div class="blk-kpi"><div class="n" id="blkMaint">0</div><div class="l">점검·불가</div></div>'
    +'</div>'
    +'<div class="tbl-scroll"><table class="blk-tbl">'
      +'<thead><tr><th>차량</th><th>번호판</th><th>상태</th><th>연료량</th><th>위치</th><th></th></tr></thead>'
      +'<tbody id="blkBody"></tbody></table></div>';

  function mount(){
    var dash=document.getElementById('tab-dash');
    if(dash && !document.getElementById('blkBody')){ dash.appendChild(sec); wireAddBtn(); }
  }

  /* ── 모달 ── */
  var modal=document.createElement('div');
  modal.className='bmodal'; modal.id='blkModal';
  modal.innerHTML=
    '<div class="bbox">'
    +'<div class="bbhd"><h3>＋ CARO THE BLACK 차량 추가</h3><button class="bbclose" id="blkClose">✕</button></div>'
    +'<div class="bbody">'
      +'<label>차량명 *</label><input id="blkName" placeholder="예: 벤츠 S클래스" maxlength="40" />'
      +'<label>번호판</label><input id="blkPlate" placeholder="예: 12가 3456" maxlength="20" />'
      +'<div class="bbrow">'
        +'<div><label>시간당 요금 (원)</label><input id="blkPrice" type="number" placeholder="예: 30000" /></div>'
        +'<div><label>상태</label><select id="blkStatus">'
          +'<option value="available">이용가능</option><option value="busy">이용중</option>'
          +'<option value="unavailable">점검·불가</option></select></div>'
      +'</div>'
      +'<label>위치</label><input id="blkPlace" placeholder="예: 인천공항 제1터미널 주차장" maxlength="60" />'
      +'<label>사진 URL (선택)</label><input id="blkImage" placeholder="https://... 이미지 주소" maxlength="300" />'
    +'</div>'
    +'<div class="bbfoot"><button class="btn" id="blkCancel">취소</button>'
    +'<button class="btn gold" id="blkSave">등록</button></div>'
    +'</div>';
  document.body.appendChild(modal);

  function openModal(){
    ['blkName','blkPlate','blkPrice','blkPlace','blkImage'].forEach(function(id){ modal.querySelector('#'+id).value=''; });
    modal.querySelector('#blkStatus').value='available';
    modal.classList.add('show'); setTimeout(function(){ modal.querySelector('#blkName').focus(); },50);
  }
  function closeModal(){ modal.classList.remove('show'); }
  modal.querySelector('#blkClose').onclick=closeModal;
  modal.querySelector('#blkCancel').onclick=closeModal;
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  modal.querySelector('#blkSave').onclick=function(){
    if(!ready()){ T('Firestore 연결 대기 중'); return; }
    var name=modal.querySelector('#blkName').value.trim();
    if(!name){ T('차량명을 입력하세요'); return; }
    var FN=window.FB_FN, db=window.FB_DB, refDoc;
    try{ refDoc=FN.doc(FN.collection(db,'bl_cars')); }catch(e){ T('저장 오류'); return; }
    var priceV=parseInt(modal.querySelector('#blkPrice').value,10);
    var data={
      name:name, plate:modal.querySelector('#blkPlate').value.trim(),
      price:(isNaN(priceV)?null:priceV), status:modal.querySelector('#blkStatus').value,
      place:modal.querySelector('#blkPlace').value.trim(),
      image:modal.querySelector('#blkImage').value.trim(),
      grade:'THE BLACK',
      createdAt:(FN.serverTimestamp?FN.serverTimestamp():new Date().toISOString())
    };
    FN.setDoc(refDoc,data).then(function(){ T('블랙 차량이 추가되었습니다'); closeModal(); })
      .catch(function(e){ console.error('[블랙] 저장 실패',e); T('저장 실패 — 권한(bl_cars)을 확인하세요'); });
  };
  function wireAddBtn(){ var b=document.getElementById('blkAddBtn'); if(b) b.onclick=openModal; }

  window.delBlack=function(id){
    if(!ready()) return;
    if(!confirm('이 블랙 차량을 삭제할까요?')) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,'bl_cars',id)).then(function(){ T('삭제되었습니다'); })
      .catch(function(e){ console.error(e); T('삭제 실패'); });
  };

  /* ── 렌더 ── */
  function render(list){
    mount();
    var body=document.getElementById('blkBody'); if(!body) return;
    var t=0,a=0,bu=0,m=0;
    var rows=(list||[]).map(function(c){
      var d=c.data||{};
      var name=d.name||d.carName||d.title||'(이름 없음)';
      var plate=d.plate||d.carNumber||d.number||'—';
      var stt=mapStatus(d.status);
      var bat=num(d.battery);
      var place=d.place||d.location||d.parkingName||'위치 정보 없음';
      t++; if(stt==='이용중')bu++; else if(stt==='점검')m++; else a++;
      return '<tr>'
        +'<td style="color:var(--txt)">'+esc(name)+'</td>'
        +'<td style="color:var(--muted);font-family:\'Saira\',sans-serif">'+esc(plate)+'</td>'
        +'<td><span class="bdot '+stCls(stt)+'"><i></i>'+stLabel(stt)+'</span></td>'
        +'<td>'+(bat==null?'<span style="color:var(--muted)">—</span>':bat+'%')+'</td>'
        +'<td style="color:var(--muted)">'+esc(place)+'</td>'
        +'<td style="text-align:right"><button class="blk-del" onclick="delBlack(\''+c.id+'\')">삭제</button></td>'
      +'</tr>';
    }).join('');
    body.innerHTML = rows || '<tr><td colspan="6" class="blk-empty">아직 등록된 CARO THE BLACK 차량이 없습니다. <b>+ 블랙 차량</b>으로 추가하세요.</td></tr>';
    var set=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('blkTotal',t); set('blkAvail',a); set('blkBusy',bu); set('blkMaint',m);
  }

  /* ── 실시간 연결 ── */
  function start(){
    mount();
    if(!ready()){ render([]); return false; }
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'bl_cars'), function(snap){
        var arr=[]; snap.forEach(function(doc){ arr.push({id:doc.id, data:doc.data()||{}}); });
        arr.sort(function(x,y){ return (x.data.name||'').localeCompare(y.data.name||''); });
        render(arr);
      }, function(e){ console.warn('[블랙] 목록 오류',e); });
    }catch(e){ console.warn('[블랙] 리스너 오류',e); }
    return true;
  }
  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[블랙] ✅ CARO THE BLACK 전용 섹션 v1 활성화');
})();
