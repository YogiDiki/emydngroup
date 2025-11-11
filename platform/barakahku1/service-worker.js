// ====================================================
// 🔥 BarakahKu - Unified Service Worker (PWA + FCM)
// Lokasi: /platform/barakahku1/service-worker.js
// ====================================================

// Force rebuild at 2025-11-11T13:52
const CACHE_NAME = 'barakahku-cache-v15';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];


console.log('🚀 [SW] BarakahKu Unified Service Worker starting...');

// ====================================================
// FIREBASE CLOUD MESSAGING INTEGRATION
// ====================================================

try {
  // Import Firebase SDK v8
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

  console.log('✅ [SW] Firebase scripts loaded');

  // Initialize Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4"
  });

  console.log('✅ [SW] Firebase initialized');

  // Get messaging instance
  const messaging = firebase.messaging();
  console.log('✅ [SW] Firebase Messaging ready');

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('📩 [SW] Background message received:', payload);
    
    const title = payload.notification?.title || 'BarakahKu';
    const options = {
      body: payload.notification?.body || 'Notifikasi baru',
      icon: '/platform/barakahku1/assets/icons/icon-192.png',
      badge: '/platform/barakahku1/assets/icons/icon-192.png',
      tag: 'barakahku-fcm',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: payload.data || {}
    };
    
    return self.registration.showNotification(title, options);
  });
} catch (err) {
  console.warn('⚠️ [SW] Firebase init failed (mungkin incognito mode):', err);
  // SW tetap berjalan untuk PWA caching meskipun FCM gagal
}

// ====================================================
// PWA CACHING STRATEGY
// ====================================================

// Install SW
self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing v13...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [SW] Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating v13...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => {
             console.log('🗑️ [SW] Delete old cache:', key);
             return caches.delete(key);
           })
      );
    }).then(() => {
      console.log('✅ [SW] Activated');
      return self.clients.claim();
    })
  );
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching untuk external APIs
  const externalAPIs = [
    'nominatim.openstreetmap.org',
    'api.aladhan.com',
    'equran.id',
    'gstatic.com',
    'googleapis.com',
    'firebaseio.com',
    'fcm.googleapis.com',
    'firebaseinstallations.googleapis.com',
    'firebase.googleapis.com'
  ];
  
  if (externalAPIs.some(api => url.hostname.includes(api))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Cache-first strategy untuk file lokal
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch((err) => {
        console.error('❌ [SW] Fetch error:', err);
      return caches.match('/platform/barakahku1/');
      });
    })
  );
});

// ====================================================
// NOTIFICATION CLICK HANDLER
// ====================================================

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data?.url || 'https://www.emydngroup.com/platform/barakahku1/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/platform/barakahku1/') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ====================================================
// MESSAGE HANDLER
// ====================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ [SW] BarakahKu Unified Service Worker v13 ready');
console.log('📍 [SW] Scope:', self.registration.scope);