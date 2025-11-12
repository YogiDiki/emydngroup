// ====================================================
// 🔥 BarakahKu - Service Worker (PWA + FCM) - v19 FINAL
// ====================================================

const CACHE_NAME = 'barakahku-cache-v19-final';

const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu v19 starting (FINAL FIX)...');

// ====================================================
// FIREBASE MESSAGING
// ====================================================

try {
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

  firebase.initializeApp({
    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4"
  });

  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log('📩 [SW] Background message:', payload);
    const title = payload.notification?.title || 'BarakahKu';
    const options = {
      body: payload.notification?.body || 'Notifikasi baru',
      icon: '/platform/barakahku1/assets/icons/icon-192.png',
      badge: '/platform/barakahku1/assets/icons/icon-192.png',
      tag: 'barakahku-fcm',
      vibrate: [200, 100, 200]
    };
    return self.registration.showNotification(title, options);
  });
  
  console.log('✅ [SW] Firebase ready');
} catch (err) {
  console.warn('⚠️ [SW] Firebase init failed:', err);
}

// ====================================================
// INSTALL & ACTIVATE
// ====================================================

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v19...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v19...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ====================================================
// FETCH - CRITICAL FIX!
// ====================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // ✅ 1. BYPASS SEMUA EXTERNAL API (equran.id, aladhan.com, dll)
  if (url.origin !== location.origin) {
    console.log('🌐 [SW] External API (bypass):', url.hostname);
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',  // ← PENTING: Jangan cache API!
        mode: 'cors'
      })
    );
    return;
  }
  
  // ✅ 2. SERVICE WORKER FILE - NEVER CACHE
  if (url.pathname.endsWith('/service-worker.js')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  
  // ✅ 3. STATIC ASSETS (icons, images) - Cache First
  if (url.pathname.includes('/assets/icons/') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg')) {
    
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) {
          console.log('💾 [SW] Cache hit:', url.pathname);
          return cached;
        }
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
  
  // ✅ 4. APP FILES (app.js, manifest.json) - Network First
  if (url.pathname.endsWith('/app.js') || 
      url.pathname.endsWith('/manifest.json')) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // ✅ 5. HTML PAGES - Network First (always fresh)
  if (url.pathname.startsWith('/platform/barakahku1')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          // Jangan cache HTML - selalu fetch fresh
          return response;
        })
        .catch(() => {
          // Fallback to cache only if offline
          return caches.match('/platform/barakahku1/index.html');
        })
    );
    return;
  }
  
  // ✅ 6. EVERYTHING ELSE - Network First
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ====================================================
// NOTIFICATION CLICK
// ====================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/platform/barakahku1';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/platform/barakahku1') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ [SW] v19 ready - ALL EXTERNAL APIs BYPASSED');