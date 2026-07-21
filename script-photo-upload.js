/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 사용 전 사진 저장 v2 (무료 방식)
   ─────────────────────────────────────────────────────────
   보관/유료(Blaze) 불필요!
   귀하가 사진 촬영을 하면 "완료(finishPhotoCapture)":
     1) 사진을 압축(긴 변 900px, JPEG)
     2) 예약 문서(reservations/{bookNo})의 사진 필드에 저장(1MB 한도 내)
   → 관리자 화면(admin-manage.js)에서 자동 표시.

   적용: index.html에서 <script src="script.js"></script> 다음 줄에
     <script src="script-photo-upload.js?v=2"></script>
═══════════════════════════════════════════════════════════════ */
(기능(){
  '엄격하게 사용';
  var MAX_DIM = 900; // 가장 긴 변 최대 px
  var 품질 = 0.5; // JPEG 품질
  var 예산 = 820000; // 예약 문서 사진 총 주전자 한도 (문자수≒ 바이트, 1MB 밖에 안전선)

  function toast(m){ try{ if(typeof window.showToast==='function'){ window.showToast(m); } }catch(e){} }

  function currentBookNo(){
    노력하다{
      var idx = window.ctrlResIdx;
      if(idx!=null && idx>=0 && window.myReservations && window.myReservations[idx]){
        return window.myReservations[idx].bookNo || null;
      }
    }catch(e){}
    null을 반환합니다.
  }
  함수 snapshotPhotos(){
    var p = window.pcarPhotos || {};
    var out = {front:[],rear:[],left:[],right:[],misc:[]}; var any=false;
    ['앞','뒤','왼쪽','오른쪽','기타'].forEach(function(s){
      (p[s]||[]).forEach(function(d){ if(typeof d==='string'&&d.indexOf('data:')===0&&d.length>30){ out[s].push(d); any=true; } });
    });
    any?out:null을 반환합니다.
  }

  /* 캔버스로 압축 */
  함수 compress(dataUrl){
    return new Promise(function(resolve){
      노력하다{
        var img=new Image();
        img.onload=function(){
          var w=img.width,h=img.height;
          if(w>=h && w>MAX_DIM){ h=Math.round(h*MAX_DIM/w); w=MAX_DIM; }
          그렇지 않고 h > w이고 h > MAX_DIM인 경우, w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
          노력하다{
            var c=document.createElement('canvas'); c.width=w; c.height=h;
            c.getContext('2d').drawImage(img,0,0,w,h);
            resolve(c.toDataURL('image/jpeg',QUALITY));
          }catch(e){ resolve(dataUrl); }
        };
        img.onerror=function(){ resolve(dataUrl); };
        img.src=dataUrl;
      }catch(e){ resolve(dataUrl); }
    });
  }

  /* 압축 후 업무(1MB 제외) */
  function buildWithinBudget(snap){
    var sides=['front','rear','left','right','misc'];
    var jobs=[];
    sides.forEach(function(side){ snap[side].forEach(function(d){ jobs.push({side:side,src:d}); }); });
    Promise.all(jobs.map(function(j){ return compress(j.src).then(function(c){ return {side:j.side,data:c}; }); }))
      .then(function(items){
        var photos={front:[],rear:[],left:[],right:[],misc:[]};
        변수 총합=0, 유지=0, ​​삭제=0;
        항목에 대해(함수(it){
          var len=it.data.length;
          만약 총액과 길이의 비율이 예산보다 작거나 같으면, 사진의 위치와 데이터를 불러와서 총액과 길이의 비율을 유지하고, 저장량을 늘립니다.
          그렇지 않으면 드롭됩니다++;
        });
        {photos:photos, kept:kept, dropped:dropped}를 반환합니다.
      });
  }

  함수 save(bookNo, photos){
    var FN=window.FB_FN, db=window.FB_DB;
    if(!db||typeof FN.setDoc!=='function') return Promise.reject(new Error('DB 미준비'));
    FN.setDoc(FN.doc(db,'reservations',bookNo),{ photos:photos, photosUploadedAt:new Date().toISOString() },{merge:true})를 반환합니다.
  }

  함수 실행(bookNo, snap){
    if(!snap) 반환; // 사진 없음
    if(!bookNo){ console.warn('[CARO 사진] 활성 예약 없음 —저장'); 반품; }
    if(!window.FB_FN || typeof window.FB_FN.setDoc!=='function'){ toast('사진 편집 준비 중'); 반품; }
    toast('📤 사진 저장 중…');
    buildWithinBudget(snap).then(function(r){
      return save(bookNo, r.photos).then(function(){
        var msg='✅ 사진 '+r.kept+'장 저장하기';
        if(r.dropped>0) msg+=' (용량 제한으로 '+r.dropped+'장 제외)';
        토스트(메시지);
        console.log('[CARO 사진] 저장하기 ●', bookNo, r);
      });
    }).catch(function(e){
      console.error('[CARO 사진] 저장 실패', e);
      toast('사진 저장 실패: '+((e&&(e.code||e.message))||'오류'));
    });
  }

  /* finishPhotoCapture 래핑 */
  함수 hook(){
    만약 window.finishPhotoCapture의 type이 'function'이 아니면 false를 반환합니다.
    만약 window.finishPhotoCapture.__caroPhotoWrapped가 true이면,
    var orig=window.finishPhotoCapture;
    var wrapped=function(){
      변수 스냅, 책 번호;
      try { snap = snapshotPhotos(); bookNo = currentBookNo(); } catch (e) { console.error(e); }
      var rv; try{ rv=orig.apply(this,arguments); }catch(e){ console.error(e); }
      try { run(bookNo, snap); } catch (e) { console.error(e); }
      rv를 반환합니다.
    };
    wrapped.__caroPhotoWrapped=true;
    window.finishPhotoCapture=wrapped;
    true를 반환합니다.
  }
  만약 후킹이 발생하지 않으면, 변수 t를 설정하고, 후킹이 발생한 경우 t를 초기화합니다. 그런 다음 400초 동안 타임아웃을 설정하고, 15000초 동안 타임아웃을 초기화합니다.
  console.log('[CARO 사진] ✅ 무료 저장(압축+Firestore) 패치 v2 적용');
})();
