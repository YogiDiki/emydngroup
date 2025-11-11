// ====================================================
// 🔥 BarakahKu - FIXED Service Worker 
// ====================================================

const CACHE_NAME = 'barakahku-fixed-v1';

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing fixed worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating fixed worker...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // ✅ BIARKAN SEMUA API REQUEST LEWAT BEBAS
  if (url.includes('equran.id') || 
      url.includes('api.aladhan.com') || 
      url.includes('nominatim.openstreetmap.org') ||
      url.includes('overpass-api.de') ||
      url.includes('firebase') ||
      url.includes('googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // ✅ Untuk file aplikasi, gunakan cache sebagai fallback saja
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Firebase Messaging
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
      tag: 'barakahku-fcm'
    };
    
    return self.registration.showNotification(title, options);
  });
} catch (err) {
  console.warn('⚠️ [SW] Firebase init failed:', err);
}

console.log('✅ [SW] Fixed worker ready - API requests allowed');