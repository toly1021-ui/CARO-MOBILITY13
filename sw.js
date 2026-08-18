/* ============================================================
   CARO MOBILITY — Service Worker 자폭(kill-switch) v34
   ------------------------------------------------------------
   예전 서비스워커가 옛 파일(index.html/customer-redesign.js 등)을 캐시로 붙잡고
   업데이트를 안 받아들이던 문제 때문에, 서비스워커를 '완전히 제거'한다.
   이 워커는 설치되는 즉시 ①모든 캐시 삭제 ②자기 등록 해제 ③열린 페이지 새로고침 을 수행한다.
   이후 앱은 서비스워커 없이, WebView의 LOAD_NO_CACHE 설정으로 항상 최신 파일을 네트워크에서 로드한다.
   (fetch 는 가로채지 않고 그대로 네트워크로 통과 → 캐시로 인한 옛 파일 서빙 원천 차단)
   ============================================================ */
const KILL = 'caro-killswitch-v34';

self.addEventListener('install', function(e){
  self.skipWaiting();   // 대기 없이 즉시 활성화
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })   // ① 모든 캐시 삭제
      .then(function(){ return self.registration.unregister(); })                                       // ② 자기 등록 해제
      .then(function(){ return self.clients.matchAll({type:'window'}); })
      .then(function(clients){ clients.forEach(function(c){ try{ c.navigate(c.url); }catch(e){} }); })   // ③ 열린 페이지 새로고침 → 최신 로드
      .catch(function(){})
  );
});

/* fetch 는 가로채지 않음 = 항상 네트워크에서 직접 (캐시 서빙 없음) */
self.addEventListener('fetch', function(e){ /* pass-through */ });
