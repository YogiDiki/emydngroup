// ====================================================
// 🔥 PWA Service Worker + Firebase Cloud Messaging
// ====================================================

const CACHE_NAME = 'barakahku-cache-v5';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png',
  'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js'
];

// ====================================================
// FIREBASE CLOUD MESSAGING SETUP
// ====================================================

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
try {
  const firebaseConfig = {
    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4",
    measurementId: "G-EQPYKJJGG7"
  };

  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // Background message handler
  messaging.onBackgroundMessage((payload) => {
    console.log('📩 [SW] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'BarakahKu';
    const notificationOptions = {
      body: payload.notification?.body || 'Pesan baru dari BarakahKu',
      icon: '/platform/barakahku1/assets/icons/icon-192.png',
      badge: '/platform/barakahku1/assets/icons/icon-192.png',
      tag: 'barakahku-bg-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Buka Aplikasi'
        },
        {
          action: 'close',
          title: 'Tutup'
        }
      ],
      data: {
        url: payload.data?.click_action || payload.notification?.click_action || '/platform/barakahku1/',
        payload: JSON.stringify(payload)
      }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });

  console.log('✅ [SW] Firebase Messaging initialized');

} catch (error) {
  console.error('❌ [SW] Firebase initialization failed:', error);
}

// ====================================================
// NOTIFICATION HANDLERS
// ====================================================

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/platform/barakahku1/';

  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then((clientList) => {
      // Cari tab yang sudah terbuka dengan scope yang sama
      for (const client of clientList) {
        if (client.url.includes('/platform/barakahku1/') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Jika tidak ada client yang terbuka, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('🔔 [SW] Notification closed:', event.notification.tag);
});

// ====================================================
// PWA CACHING LOGIC
// ====================================================

self.addEventListener('install', (event) => {
  console.log('✅ [SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Caching app shell...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ [SW] All resources cached');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('✅ [SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Cleanup completed');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Chrome extensions and external resources
  if (event.request.url.startsWith('chrome-extension://') || 
      !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the new response for same-origin requests
            caches.open(CACHE_NAME)
              .then((cache) => {
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch((error) => {
            console.error('❌ [SW] Fetch failed:', error);
            // Return offline page or fallback here if needed
          });
      })
  );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
  console.log('📨 [SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ [SW] Service Worker loaded successfully');