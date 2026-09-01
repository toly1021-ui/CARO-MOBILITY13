/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 시간 연장 v1 (자유 선택 + 결제 선택)
   ───────────────────────────────────────────────────────────
   · 이 블록을 customer-redesign.js "맨 끝"에 그대로 붙여넣으세요.
   · 연장 시트 = 주행전 사진 시트와 동일한 반화면(56vh)
   · 자유 선택: 칩(30분~1일) + ±10분 스테퍼, 상한 = 같은 차량 다음 예약 직전까지
     (뒤에 예약 없으면 최대 24시간)
   · "시간연장 확정" → 결제 선택(등록 카드 / 토스페이먼츠) 2개만
   · 기존 #extend-sheet 재사용, window.openExtendSheet 오버라이드
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function svg(i){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+i+'</svg>'; }
  var IC={
    card: svg('<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'),
    toss: svg('<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="10" y1="18" x2="14" y2="18"/>')
  };

  var st=document.createElement('style');
  st.textContent=`
    #extend-sheet{height:56vh!important;max-height:56vh!important;display:flex!important;flex-direction:column!important;padding-bottom:0!important;}
    .cxe-head{display:flex;align-items:center;justify-content:space-between;padding:14px 14px 12px;border-bottom:1px solid var(--border-l);flex-shrink:0;}
    .cxe-title{font-size:1rem;font-weight:700;color:var(--text-1);letter-spacing:.02em;}
    .cxe-icobtn{background:none;border:none;font-size:1.25rem;color:var(--text-2);cursor:pointer;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:10px;line-height:1;font-family:inherit;}
    .cxe-icobtn:active{background:rgba(0,0,0,.05);}
    .cxe-body{flex:1;min-height:0;overflow-y:auto;padding:14px 16px 8px;}
    .cxe-cur{font-size:.82rem;color:var(--text-2);text-align:center;margin-bottom:14px;line-height:1.55;}
    .cxe-cur b{color:var(--text-1);font-weight:700;}
    .cxe-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
    .cxe-chip{padding:11px 4px;border:1px solid var(--border-l);border-radius:12px;background:#fff;text-align:center;font-size:.82rem;font-weight:600;color:var(--text-1);cursor:pointer;transition:all .15s;}
    .cxe-chip.on{border-color:var(--accent);background:var(--accent);color:#fff;}
    .cxe-stepper{display:flex;align-items:center;justify-content:center;gap:16px;margin:2px 0 16px;}
    .cxe-step{width:46px;height:46px;border-radius:50%;border:1px solid var(--border-l);background:#fff;font-size:1.5rem;color:var(--accent);cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;font-family:inherit;}
    .cxe-stepval{min-width:130px;text-align:center;font-size:1.05rem;font-weight:800;color:var(--text-1);}
    .cxe-sum{background:rgba(240,244,250,.75);border:1px solid var(--border-l);border-radius:14px;padding:13px 15px;font-size:.84rem;}
    .cxe-sum .r{display:flex;justify-content:space-between;margin:4px 0;color:var(--text-2);}
    .cxe-sum .r.tot{margin-top:8px;padding-top:9px;border-top:1px solid var(--border-l);font-weight:800;color:var(--text-1);font-size:.96rem;}
    .cxe-sum b{color:var(--text-1);}
    .cxe-foot{padding:10px 16px calc(14px + var(--sab,0px));flex-shrink:0;}
    .cxe-confirm{width:100%;padding:15px;border:none;border-radius:14px;background:var(--accent);color:#fff;font-size:.95rem;font-weight:700;cursor:pointer;font-family:inherit;}
    .cxe-confirm:disabled{opacity:.4;cursor:default;}
    .cxe-pay{display:flex;align-items:center;gap:13px;width:100%;padding:16px 15px;border:1px solid var(--border-l);border-radius:14px;background:#fff;cursor:pointer;margin-bottom:11px;text-align:left;font-family:inherit;}
    .cxe-pay:active{background:rgba(0,0,0,.03);}
    .cxe-pay .ic{width:30px;height:30px;flex-shrink:0;color:var(--accent-2);display:flex;align-items:center;justify-content:center;}
    .cxe-pay .ic svg{width:26px;height:26px;}
    .cxe-pay .tx{flex:1;}
    .cxe-pay .tt{font-size:.92rem;font-weight:700;color:var(--text-1);display:block;}
    .cxe-pay .sb{font-size:.72rem;color:var(--text-m);margin-top:2px;display:block;}
    .cxe-pay .ar{color:var(--text-m);font-size:1.15rem;}
  `;
  (document.head||document.documentElement).appendChild(st);

  function asDate(x){ return x instanceof Date ? x : new Date(x); }
  function getActiveRes(){
    var rs=window.myReservations||[]; var now=Date.now(); var a=null,as=null;
    rs.forEach(function(r){
      if(!r||r.returned||!r.start||!r.end) return;
      var s=asDate(r.start).getTime(), e=asDate(r.end).getTime();
      if(isNaN(s)||isNaN(e)) return;
      var act=now>=s&&now<=e;
      if(!a){ a=r; as=s; return; }
      var pa=now>=asDate(a.start).getTime()&&now<=asDate(a.end).getTime();
      if(act&&!pa){ a=r; as=s; } else if(!act&&!pa&&s<as){ a=r; as=s; }
    });
    return a;
  }
  function fmtDT(d){ d=asDate(d); if(isNaN(d)) return ''; var p=function(n){return n<10?'0'+n:n;}; return (d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes()); }
  function fmtDur(m){ m=Math.round(m); if(m<=0) return '0분'; var d=Math.floor(m/1440), h=Math.floor((m%1440)/60), mm=m%60, a=[]; if(d)a.push(d+'일'); if(h)a.push(h+'시간'); if(mm)a.push(mm+'분'); return a.join(' '); }

  var EXT={r:null,cap:0,mins:0,carRate:0,insRate:0};
  function extCost(m){ var c=Math.round(EXT.carRate*(m/60)), i=Math.round(EXT.insRate*(m/60)); return {car:c,ins:i,tot:c+i}; }
  function extActiveRes(){
    var idx=window.ctrlResIdx;
    if(typeof idx==='number'&&idx>=0&&window.myReservations&&window.myReservations[idx]) return window.myReservations[idx];
    return getActiveRes();
  }
  function extMaxMins(r){
    var cap=24*60;
    var gar=window.globalActiveReservations||[];
    var cid=r.car&&r.car.id, endT=asDate(r.end).getTime(), next=null;
    gar.forEach(function(o){
      if(!o||!o.car||o.car.id!==cid) return;
      if(o.bookNo&&r.bookNo&&o.bookNo===r.bookNo) return;
      var s=asDate(o.start).getTime();
      if(!isNaN(s)&&s>endT){ if(next===null||s<next) next=s; }
    });
    if(next!==null) cap=Math.max(0,Math.floor((next-endT)/60000));
    return cap;
  }
  function openSheet(){ var sh=document.getElementById('extend-sheet'), ov=document.getElementById('ext-overlay'); if(sh) sh.classList.add('open'); if(ov) ov.classList.add('show'); }
  window.caroExtClose=function(){
    if(window.closeExtendSheet){ try{ window.closeExtendSheet(); return; }catch(e){} }
    var sh=document.getElementById('extend-sheet'), ov=document.getElementById('ext-overlay'); if(sh) sh.classList.remove('open'); if(ov) ov.classList.remove('show');
  };

  function openExtendSheetCaro(){
    var r=extActiveRes();
    if(!r){ if(window.showToast)showToast('연장할 예약이 없습니다.'); return; }
    var car=r.car||{}, ins=r.ins||(window.INSURANCE&&window.INSURANCE[0])||{};
    EXT={r:r,cap:extMaxMins(r),mins:0,carRate:car.pricePerHour||0,insRate:ins.pricePerHour||0};
    renderStep1(); openSheet();
  }
  function renderStep1(){
    var sheet=document.getElementById('extend-sheet'); if(!sheet) return;
    var r=EXT.r, cap=EXT.cap, chips='';
    [30,60,120,180,360,720,1440].forEach(function(m){ if(m<=cap) chips+='<div class="cxe-chip" data-m="'+m+'" onclick="caroExtSel('+m+')">'+fmtDur(m)+'</div>'; });
    if(cap>0) chips+='<div class="cxe-chip" data-m="'+cap+'" onclick="caroExtSel('+cap+')">최대</div>';
    var head='<div class="cxe-head"><span style="width:34px"></span><span class="cxe-title">시간 연장</span><button class="cxe-icobtn" onclick="caroExtClose()">✕</button></div>';
    var body;
    if(cap>0){
      body='<div class="cxe-body"><div class="cxe-cur">현재 반납 <b>'+fmtDT(r.end)+'</b><br>최대 <b>'+fmtDur(cap)+'</b> 연장 가능</div>'+
        '<div class="cxe-chips">'+chips+'</div>'+
        '<div class="cxe-stepper"><button class="cxe-step" onclick="caroExtStep(-10)">−</button>'+
        '<span class="cxe-stepval" id="cxe-val">'+(EXT.mins?fmtDur(EXT.mins):'시간 선택')+'</span>'+
        '<button class="cxe-step" onclick="caroExtStep(10)">＋</button></div>'+
        '<div class="cxe-sum" id="cxe-sum" style="display:none"></div></div>'+
        '<div class="cxe-foot"><button class="cxe-confirm" id="cxe-ok" onclick="caroExtToPay()" disabled>시간연장 확정</button></div>';
    } else {
      body='<div class="cxe-body"><div class="cxe-cur">현재 반납 <b>'+fmtDT(r.end)+'</b></div><div class="cxe-cur" style="color:var(--text-m)">다음 예약이 곧 시작되어<br>연장할 수 있는 시간이 없어요.</div></div>'+
        '<div class="cxe-foot"><button class="cxe-confirm" onclick="caroExtClose()">닫기</button></div>';
    }
    sheet.innerHTML=head+body; updateSum();
  }
  function markChips(v){ var cs=document.querySelectorAll('#extend-sheet .cxe-chip'); Array.prototype.forEach.call(cs,function(c){ c.classList.toggle('on', parseInt(c.getAttribute('data-m'),10)===v); }); }
  window.caroExtSel=function(m){ EXT.mins=Math.max(0,Math.min(m,EXT.cap)); markChips(m); updateSum(); };
  window.caroExtStep=function(d){ var v=(EXT.mins||0)+d; if(v<10)v=10; if(v>EXT.cap)v=EXT.cap; EXT.mins=v; markChips(v); updateSum(); };
  function updateSum(){
    var val=document.getElementById('cxe-val'); if(val) val.textContent=EXT.mins?fmtDur(EXT.mins):'시간 선택';
    var ok=document.getElementById('cxe-ok'); if(ok) ok.disabled=!EXT.mins;
    var sum=document.getElementById('cxe-sum'); if(!sum) return;
    if(!EXT.mins){ sum.style.display='none'; return; }
    var c=extCost(EXT.mins), ne=new Date(asDate(EXT.r.end).getTime()+EXT.mins*60000);
    sum.style.display='block';
    sum.innerHTML='<div class="r"><span>새 반납 시각</span><b>'+fmtDT(ne)+'</b></div>'+
      '<div class="r"><span>대여 요금</span><span>'+c.car.toLocaleString()+'원</span></div>'+
      '<div class="r"><span>보험 요금</span><span>'+c.ins.toLocaleString()+'원</span></div>'+
      '<div class="r tot"><span>결제 금액</span><span>'+c.tot.toLocaleString()+'원</span></div>';
  }
  window.caroExtToPay=function(){
    if(!EXT.mins) return;
    var sheet=document.getElementById('extend-sheet'); if(!sheet) return;
    var c=extCost(EXT.mins), cards=window.savedCards||[], cardOpt;
    if(cards.length){
      var cd=cards[0];
      cardOpt='<button class="cxe-pay" onclick="caroExtPayCard()"><span class="ic">'+IC.card+'</span><span class="tx"><span class="tt">등록된 카드로 결제</span><span class="sb">'+(cd.alias||'카드')+' ···· '+(cd.last4||'****')+'</span></span><span class="ar">›</span></button>';
    } else {
      cardOpt='<button class="cxe-pay" onclick="caroExtNoCard()"><span class="ic">'+IC.card+'</span><span class="tx"><span class="tt">등록된 카드로 결제</span><span class="sb">등록된 카드가 없습니다</span></span><span class="ar">›</span></button>';
    }
    sheet.innerHTML='<div class="cxe-head"><button class="cxe-icobtn" onclick="caroExtBack()">‹</button><span class="cxe-title">결제 수단</span><button class="cxe-icobtn" onclick="caroExtClose()">✕</button></div>'+
      '<div class="cxe-body"><div class="cxe-cur"><b>'+fmtDur(EXT.mins)+'</b> 연장 · <b>'+c.tot.toLocaleString()+'원</b></div>'+
      cardOpt+
      '<button class="cxe-pay" onclick="caroExtPayToss()"><span class="ic">'+IC.toss+'</span><span class="tx"><span class="tt">토스페이먼츠로 결제</span><span class="sb">카드 · 계좌 · 간편결제</span></span><span class="ar">›</span></button></div>';
  };
  window.caroExtBack=function(){ renderStep1(); };
  window.caroExtNoCard=function(){ if(window.showToast)showToast('등록된 카드가 없습니다. 메뉴 > 결제수단에서 먼저 등록해 주세요.'); };
  window.caroExtPayCard=function(){ applyExt('card'); };
  window.caroExtPayToss=function(){ applyExt('toss'); };
  function applyExt(method){
    var r=EXT.r, mins=EXT.mins; if(!r||!mins) return;
    var c=extCost(mins);
    r.end=new Date(asDate(r.end).getTime()+mins*60000);
    r.extendedMins=(r.extendedMins||0)+mins;
    r.total=(r.total||0)+c.tot;
    if(window.startHomeCtrlTimer){ try{ startHomeCtrlTimer(asDate(r.start),r.end); }catch(e){} }
    var dur=document.getElementById('home-ctrl-duration'); if(dur) dur.textContent=fmtDT(r.start)+' ~ '+fmtDT(r.end);
    var ext=document.getElementById('home-ctrl-extend-info'); if(ext) ext.textContent='+'+fmtDur(r.extendedMins)+' 연장됨';
    if(window.renderMyReservations){ try{ renderMyReservations(); }catch(e){} }
    if(window.saveUserData){ try{ saveUserData(); }catch(e){} }
    window.caroExtClose();
    var label=method==='card'?'등록 카드 결제':'토스페이먼츠 결제';
    if(window.showToast) showToast(label+' 완료 · '+fmtDur(mins)+' 연장 (반납 '+fmtDT(r.end)+')');
  }

  function boot(){
    window.openExtendSheet=openExtendSheetCaro;
    window.confirmExtendSheet=window.caroExtToPay;
    console.log('[컨트롤러] ✅ 시간 연장 v1 (자유선택 + 결제선택)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
