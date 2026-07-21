/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 고객 홈 공지·이벤트 (Firestore 캐스팅) v3
   ─────────────────────────────────────────────────────────
   · 즉시 시작 index.html의 "가짜 기본 공지"를 숨김
   · Firestore에 실제로 공지가 있을 표시(없으면 숨김)
   · 클릭 시 제목 + 내용(본문) 상세보기 모달
   적용: index.html 의 script.js 줄 다음
     <script src="customer-notices.js?v=3"></script>
═══════════════════════════════════════════════════════════════ */
(기능(){
  '엄격하게 사용';
  var 캐시={};
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&','<':'<','>':'>','"':'"'}[c];}); }
  function fmtDate(iso){ try{ var d=new Date(iso); if(isNaN(d.getTime())) return ''; var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate()); }catch(e){ return ''; } }
  function tagOf(n){ var t=(n&&n.type)||''; if(t==='이벤트') return {label:'이벤트',cls:'notice-tag new-tag'}; if(t==='공지') return {label:'공지',cls:'notice-tag'}; if(/이벤트|할인|혜택|event|sale/i.test((n&&n.title)||'')) return {label:'이벤트',cls:'notice-tag new-tag'}; return {label:'공지',cls:'notice-tag'}; }

  함수 setSection(show){
    var nl=document.querySelector('.home-notice-list'); if(!nl) return;
    nl.style.display = 표시 ? '' : '없음';
    var title=nl.previousElementSibling;
    만약 제목이 'home-section-title'과 같은 클래스 목록을 포함하고 있다면,
      title.style.display = 표시 ? '' : '없음';
    }
  }

  함수 render(notices){
    var nl=document.querySelector('.home-notice-list'); if(!nl) return;
    캐시={};
    if(!notices.length){ nl.innerHTML=''; setSection(false); 반품; } /* 공지 0개 → 숨김 */
    nl.innerHTML=notices.map(function(n){
      캐시[n.id]=n;
      var tg=tagOf(n);
      '<div class="home-notice-item" onclick="window.openFsNotice(\''+n.id+'\')">'+를 반환합니다.
        '<span class="'+tg.cls+'">'+tg.label+'</span>'+
        '<span class="notice-text">'+esc(n.title)+'</span>'+
        '<span class="notice-date">'+fmtDate(n.createdAt)+'</span>'+
        '</div>';
    }).가입하다('');
    섹션을 설정(true);
  }

  window.openFsNotice=function(id){
    var n=cache[id]; if(!n) return;
    var t=document.getElementById('notice-title'), b=document.getElementById('notice-body');
    if(t) t.textContent=n.title;
    if(b) b.innerHTML = n.body ? n.body : ('<p>'+esc(n.title)+'</p>');
    만약 window.openModal의 typeof가 'function'이면 window.openModal('notice-modal')을 실행합니다.
  };

  함수 시작(){
    준비되지 않았으면 false를 반환합니다.
    var FN=window.FB_FN, db=window.FB_DB;
    노력하다{
      FN.onSnapshot(FN.collection(db,'notices'), function(snap){
        var arr=[]; snap.forEach(function(d){ var x=d.data()||{}; arr.push({id:d.id, title:x.title||'', body:x.body||'', type:x.type||'', createdAt:x.createdAt||''}); });
        arr.sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
        렌더링(arr);
      }, function(err){ console.warn('[공지] 고객 리스너 오류', (err&&(err.code||err.message))||err); });
    }catch(e){ console.warn('[공지] 고객 시작 실패', e); 사실을 반환; }
    true를 반환합니다.
  }

  /* ★ 즉시 시작: 가짜 기본 공지 숨김 (Firestore 응답) */
  섹션을 false로 설정합니다.

  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},20000); }
  console.log('[공지] ✅ 고객 홈 Firestore 공지 패치 v3 (가짜 기본공지 제거)');
})();
