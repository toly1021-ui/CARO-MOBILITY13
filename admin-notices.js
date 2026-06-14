/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 공지·이벤트 (Firestore 연동) v1
   ───────────────────────────────────────────────────────────
   admin.html 공지 탭을 실제 저장되게:
     · 추가/삭제 → Firestore(notices 컬렉션)
     · 실시간 목록 (새로고침해도 유지, 고객 앱과 공유)
   적용: admin.html </body> 바로 위에
     <script src="admin-notices.js?v=1"></script>
   ※ Firestore 규칙에 notices 컬렉션 추가 필요 (안내문 참고)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var cache=[];
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmtDate(iso){ try{ var d=new Date(iso); if(isNaN(d.getTime())) return ''; var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }catch(e){ return ''; } }
  function toast(m){ try{ if(typeof window.toast==='function') window.toast(m); }catch(e){} }

  function render(){
    var box=document.getElementById('noticeList'); if(!box) return;
    if(!cache.length){ box.innerHTML='<div style="color:var(--muted);padding:8px">등록된 공지가 없습니다.</div>'; return; }
    box.innerHTML=cache.map(function(n){
      return '<div class="list-item"><div><div>'+esc(n.title)+'</div>'+
        '<div class="meta">'+fmtDate(n.createdAt)+' · 게시중</div></div>'+
        '<button class="btn sm" onclick="window.delNotice(\''+n.id+'\')">삭제</button></div>';
    }).join('');
  }

  function start(){
    if(!ready()) return false;
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'notices'), function(snap){
        var arr=[]; snap.forEach(function(d){ var x=d.data()||{}; arr.push({id:d.id, title:x.title||'', createdAt:x.createdAt||''}); });
        arr.sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
        cache=arr; render();
      }, function(err){ console.error('[공지] 리스너 오류', err); });
    }catch(e){ console.error('[공지] 시작 실패', e); return true; }
    return true;
  }

  /* 추가 → Firestore (자동 ID) */
  window.addNotice=function(){
    var el=document.getElementById('noticeInput'); if(!el) return;
    var t=(el.value||'').trim();
    if(!t){ toast('제목을 입력하세요'); return; }
    if(!ready()){ toast('연결 준비 중입니다'); return; }
    var FN=window.FB_FN, db=window.FB_DB;
    var ref=FN.doc(FN.collection(db,'notices'));
    FN.setDoc(ref,{ title:t, createdAt:new Date().toISOString() }).then(function(){
      el.value=''; toast('공지가 추가되었습니다');
    }).catch(function(e){ console.error('[공지] 추가 실패',e); toast('추가 실패: '+((e&&e.code)||'권한/연결 확인')); });
  };

  /* 삭제 → Firestore */
  window.delNotice=function(id){
    if(!ready()) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,'notices',id)).then(function(){ toast('삭제되었습니다'); })
      .catch(function(e){ console.error('[공지] 삭제 실패',e); toast('삭제 실패: '+((e&&e.code)||'권한/연결 확인')); });
  };

  /* 기존 하드코딩 renderNotice 무력화 */
  window.renderNotice=function(){ render(); };

  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[공지] ✅ 관리자 Firestore 공지 패치 v1');
})();
