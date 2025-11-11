// ====================================================
// 🔥 PWA Service Worker + Firebase Cloud Messaging
// BarakahKu - Complete Service Worker (Fixed Version)
// ====================================================

// PWA Cache Configuration
const CACHE_NAME = 'barakahku-cache-v5';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

// ====================================================
// FIREBASE CLOUD MESSAGING SETUP
// ====================================================

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
  authDomain: "barakahku-app.firebaseapp.com",
  projectId: "barakahku-app",
  storageBucket: "barakahku-app.firebasestorage.app",
  messagingSenderId: "510231053293",
  appId: "1:510231053293:web:921b9e574fc614492b5de4",
  measurementId: "G-EQPYKJJGG7"
});

const messaging = firebase.messaging();

console.log('✅ [SW] Firebase Messaging initialized in Service Worker');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📩 [SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'BarakahKu';
  const notificationOptions = {
    body: payload.notification?.body || 'Notifikasi baru dari BarakahKu',
    icon: '/platform/barakahku1/assets/icons/icon-192.png',
    badge: '/platform/barakahku1/assets/icons/icon-192.png',
    tag: 'barakahku-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: payload.notification?.click_action || payload.data?.url || 'https://www.emydngroup.com/platform/barakahku1/',
      ...payload.data
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/platform/barakahku1/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah ada window yang sudah terbuka
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/platform/barakahku1/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Jika tidak ada, buka window baru
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ====================================================
// PWA CACHING LOGIC
// ====================================================

// Install SW
self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing Service Worker v5...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 [SW] Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
  // Force activate immediately
  self.skipWaiting();
});

// Activate SW & bersihkan cache lama
self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating Service Worker v5...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
           .map((key) => {
             console.log('🗑️ [SW] Deleting old cache:', key);
             return caches.delete(key);
           })
      );
    }).then(() => {
      console.log('✅ [SW] Service Worker activated and ready');
      return self.clients.claim();
    })
  );
});

// Fetch dari cache dulu, fallback ke network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Clone response karena response hanya bisa digunakan sekali
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch((err) => {
        console.error('❌ [SW] Fetch error:', err);
        // Return offline fallback jika ada
        return caches.match('/platform/barakahku1/index.html');
      });
    })
  );
});

// Message handler dari client
self.addEventListener('message', (event) => {
  console.log('📨 [SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ [SW] BarakahKu Service Worker v5 ready with Firebase Messaging');