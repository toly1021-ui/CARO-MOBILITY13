/* ══════════════════════════════════════════
   CARO MOBILITY — Service Worker v7
   - 앱 파일: 네트워크 우선 (항상 최신, 오프라인 시 캐시)
   - Firebase/Firestore: 서비스워커 개입 안 함(브라우저 직접 처리)
   - chrome-extension 등 비-HTTP 요청: 완전 무시
   - 캐시 번호 안 올려도 수정이 바로 반영됨
══════════════════════════════════════════ */
const CACHE_NAME = 'caro-v7';

/* 오프라인 대비용 기본 캐시 */
const CACHE_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* 캐시 제외(서비스워커가 손대지 않을) 도메인 */
const BYPASS_DOMAINS = [
  'firebaseapp.com',
  'googleapis.com',
  'gstatic.com',
  'firebase.google.com',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'firebasestorage.googleapis.com'
];

/* 설치 — 기본 파일 캐시 후 즉시 활성화 */
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(c){ return c.addAll(CACHE_ASSETS); })
      .then(function(){ return self.skipWaiting(); })
      .catch(function(err){ console.warn('[SW] install error:', err); })
  );
});

/* 활성화 — 구 캐시 전부 삭제 */
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

/* 안전한 캐시 저장 (실패해도 조용히 무시) */
function safePut(req, res){
  try{
    caches.open(CACHE_NAME).then(function(c){
      c.put(req, res).catch(function(){});
    }).catch(function(){});
  }catch(e){}
}

/* 요청 처리 */
self.addEventListener('fetch', function(e){
  var url = e.request.url;

  /* GET 외 무시 */
  if(e.request.method !== 'GET') return;

  /* http(s)가 아닌 요청(chrome-extension:// 등) — 완전 무시 */
  if(url.indexOf('http') !== 0) return;

  /* Firebase / Firestore / Google API — 서비스워커 개입 안 함
     (respondWith 호출하지 않고 그냥 return → 브라우저가 직접 처리.
      Firestore 실시간 스트리밍이 끊기지 않음) */
  if(BYPASS_DOMAINS.some(function(d){ return url.indexOf(d) !== -1; })){
    return;
  }

  /* firebase-config.js — ES Module, 캐시 제외 */
  if(url.indexOf('firebase-config.js') !== -1){
    e.respondWith(fetch(e.request).catch(function(){
      return new Response('/* offline */', {
        headers:{'Content-Type':'application/javascript'}
      });
    }));
    return;
  }

  /* CDN — 네트워크 우선 */
  if(url.indexOf('unpkg.com') !== -1 ||
     url.indexOf('openstreetmap.org') !== -1 ||
     url.indexOf('googleapis.com/css') !== -1 ||
     url.indexOf('jsdelivr.net') !== -1 ||
     url.indexOf('gstatic.com/firebasejs') !== -1){
    e.respondWith(
      fetch(e.request)
        .then(function(res){
          if(res && res.ok){ safePut(e.request, res.clone()); }
          return res;
        })
        .catch(function(){ return caches.match(e.request); })
    );
    return;
  }

  /* 앱 파일 — 네트워크 우선(항상 최신), 실패하면 캐시 */
  e.respondWith(
    fetch(e.request)
      .then(function(res){
        if(res && res.ok){ safePut(e.request, res.clone()); }
        return res;
      })
      .catch(function(){
        return caches.match(e.request).then(function(cached){
          return cached || caches.match('./index.html');
        });
      })
  );
});
