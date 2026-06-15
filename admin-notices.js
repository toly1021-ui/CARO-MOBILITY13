/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 공지·이벤트 (Firestore 연동) v2
   ───────────────────────────────────────────────────────────
   · "추가" 버튼 → 제목 + 내용 입력 창(모달)
   · 추가/삭제 → Firestore(notices), 실시간 목록
   · 저장한 내용(body)은 고객이 공지 클릭 시 상세로 표시됨
   적용: admin.html </body> 위에
     <script src="admin-notices.js?v=2"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var cache=[];
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmtDate(iso){ try{ var d=new Date(iso); if(isNaN(d.getTime())) return ''; var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }catch(e){ return ''; } }
  function toast(m){ try{ if(typeof window.toast==='function') window.toast(m); }catch(e){} }

  /* ── 제목+내용 입력 모달 주입 (1회) ── */
  function buildModal(){
    if(document.getElementById('noticeEditModal')) return;
    var ov=document.createElement('div');
    ov.id='noticeEditModal';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:99999;';
    ov.innerHTML=
      '<div id="ne-box" style="background:var(--panel2,#1f2228);border:1px solid var(--border2,#34383f);border-radius:14px;width:min(560px,92vw);padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);">'
      + '<div style="font-size:18px;font-weight:700;color:var(--gold,#c8a96e);margin-bottom:16px;">공지·이벤트 작성</div>'
      + '<label style="display:block;font-size:13px;color:var(--muted,#868b94);margin-bottom:6px;">제목</label>'
      + '<input id="ne-title" placeholder="예) [이벤트] 신규가입 1시간 무료 이용권" style="width:100%;box-sizing:border-box;background:var(--panel,#1b1d21);border:1px solid var(--border,#2b2e34);border-radius:8px;color:var(--txt,#e9eaed);padding:10px 12px;font-size:14px;margin-bottom:14px;outline:none;" />'
      + '<label style="display:block;font-size:13px;color:var(--muted,#868b94);margin-bottom:6px;">내용</label>'
      + '<textarea id="ne-body" rows="6" placeholder="공지/이벤트 상세 내용을 입력하세요. (줄바꿈 가능)" style="width:100%;box-sizing:border-box;background:var(--panel,#1b1d21);border:1px solid var(--border,#2b2e34);border-radius:8px;color:var(--txt,#e9eaed);padding:10px 12px;font-size:14px;resize:vertical;outline:none;font-family:inherit;line-height:1.5;"></textarea>'
      + '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;">'
      + '<button id="ne-cancel" class="btn">취소</button>'
      + '<button id="ne-save" class="btn gold">등록</button>'
      + '</div></div>';
    document.body.appendChild(ov);
    /* 닫기: 오버레이 클릭 / 취소 */
    ov.addEventListener('click',function(e){ if(e.target===ov) closeModal(); });
    document.getElementById('ne-cancel').addEventListener('click',closeModal);
    document.getElementById('ne-save').addEventListener('click',submitModal);
  }
  function openModal(prefillTitle){
    buildModal();
    var ov=document.getElementById('noticeEditModal');
    var t=document.getElementById('ne-title'), b=document.getElementById('ne-body');
    if(t) t.value=prefillTitle||''; if(b) b.value='';
    ov.style.display='flex';
    if(t) setTimeout(function(){ t.focus(); },50);
  }
  function closeModal(){ var ov=document.getElementById('noticeEditModal'); if(ov) ov.style.display='none'; }

  function submitModal(){
    var t=(document.getElementById('ne-title').value||'').trim();
    var bodyRaw=(document.getElementById('ne-body').value||'');
    if(!t){ toast('제목을 입력하세요'); return; }
    if(!ready()){ toast('연결 준비 중입니다'); return; }
    var bodyHtml = esc(bodyRaw).replace(/\n/g,'<br>');   /* 안전 변환 + 줄바꿈 유지 */
    var FN=window.FB_FN, db=window.FB_DB;
    var ref=FN.doc(FN.collection(db,'notices'));
    FN.setDoc(ref,{ title:t, body:bodyHtml, createdAt:new Date().toISOString() }).then(function(){
      closeModal();
      var ni=document.getElementById('noticeInput'); if(ni) ni.value='';
      toast('공지가 등록되었습니다');
    }).catch(function(e){ console.error('[공지] 등록 실패',e); toast('등록 실패: '+((e&&e.code)||'권한/연결 확인')); });
  }

  /* ── 목록 렌더 ── */
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

  /* "추가" 버튼 → 제목+내용 모달 열기 (기존 입력칸 내용은 제목으로 미리 채움) */
  window.addNotice=function(){
    var ni=document.getElementById('noticeInput');
    openModal(ni ? (ni.value||'').trim() : '');
  };
  /* 삭제 */
  window.delNotice=function(id){
    if(!ready()) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,'notices',id)).then(function(){ toast('삭제되었습니다'); })
      .catch(function(e){ console.error('[공지] 삭제 실패',e); toast('삭제 실패: '+((e&&e.code)||'권한/연결 확인')); });
  };
  window.renderNotice=function(){ render(); };

  buildModal();
  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[공지] ✅ 관리자 공지 패치 v2 (제목+내용 모달)');
})();
