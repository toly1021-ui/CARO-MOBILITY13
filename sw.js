/* ══════════════════════════════════════════
   CARO MOBILITY — Service Worker v3
   - 앱 파일 캐시 우선 (offline 지원)
   - Firebase / ES Module 캐시 제외
   - CDN 네트워크 우선
══════════════════════════════════════════ */
const CACHE_NAME = 'caro-v3';

/* 캐시할 앱 정적 파일 (firebase-config.js 제외 — ES Module) */
const CACHE_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* 캐시 제외 도메인 */
const BYPASS_DOMAINS = [
  'firebaseapp.com',
  'googleapis.com',
  'gstatic.com',
  'firebase.google.com',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com'
];

/* 설치 */
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(c){ return c.addAll(CACHE_ASSETS); })
      .then(function(){ return self.skipWaiting(); })
      .catch(function(err){ console.warn('[SW] install error:', err); })
  );
});

/* 활성화 — 구 캐시 삭제 */
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

/* 요청 처리 */
self.addEventListener('fetch', function(e){
  var url = e.request.url;

  /* GET 아닌 요청은 무시 */
  if(e.request.method !== 'GET') return;

  /* Firebase / Google API — 캐시 완전 제외 */
  if(BYPASS_DOMAINS.some(function(d){ return url.includes(d); })){
    e.respondWith(fetch(e.request));
    return;
  }

  /* firebase-config.js — ES Module, 캐시 제외 */
  if(url.includes('firebase-config.js')){
    e.respondWith(fetch(e.request).catch(function(){
      return new Response('/* offline */', {
        headers:{'Content-Type':'application/javascript'}
      });
    }));
    return;
  }

  /* CDN (leaflet, 지도 타일, 폰트) — 네트워크 우선 */
  if(url.includes('unpkg.com') ||
     url.includes('openstreetmap.org') ||
     url.includes('googleapis.com/css') ||
     url.includes('jsdelivr.net') ||
     url.includes('gstatic.com/firebasejs')){
    e.respondWith(
      fetch(e.request)
        .then(function(res){
          var clone = res.clone();
          if(res.ok){
            caches.open(CACHE_NAME).then(function(c){ c.put(e.request, clone); });
          }
          return res;
        })
        .catch(function(){ return caches.match(e.request); })
    );
    return;
  }

  /* 앱 파일 — 캐시 우선, 없으면 네트워크 */
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(res){
        if(res.ok){
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      });
    }).catch(function(){
      return caches.match('./index.html');
    })
  );
});
