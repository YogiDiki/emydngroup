// BarakahKu Service Worker
// Handles offline caching and push notifications

const CACHE_NAME = 'barakahku-v1';
const API_CACHE = 'barakahku-api-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/barakah.html',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  'https://equran.id/api/v2/surat',
  'https://api.aladhan.com/v1/timings'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🕌 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🕌 Service Worker activated');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== API_CACHE)
            .map(name => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests differently
  if (url.origin.includes('equran.id') || url.origin.includes('aladhan.com')) {
    event.respondWith(
      caches.open(API_CACHE)
        .then(cache => {
          return fetch(request)
            .then(response => {
              // Cache successful API responses
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Fallback to cached API data when offline
              return cache.match(request);
            });
        })
    );
    return;
  }

  // Handle static assets - Cache First strategy
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          console.log('📦 Serving from cache:', request.url);
          return cached;
        }

        return fetch(request)
          .then(response => {
            // Cache new resources
            if (response.ok) {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, response.clone());
                  return response;
                });
            }
            return response;
          })
          .catch(error => {
            console.error('❌ Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/barakah.html');
            }
          });
      })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Waktu sholat telah tiba',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'prayer-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Buka App' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BarakahKu - Pengingat Sholat', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/barakah.html')
    );
  }
});

// Background sync for prayer times
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-prayer-times') {
    event.waitUntil(syncPrayerTimes());
  }
});

async function syncPrayerTimes() {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    const today = new Date();
    const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=11`
    );
    
    const data = await response.json();
    
    // Cache the result
    const cache = await caches.open(API_CACHE);
    await cache.put('prayer-times-today', new Response(JSON.stringify(data)));
    
    console.log('✅ Prayer times synced');
  } catch (error) {
    console.error('❌ Failed to sync prayer times:', error);
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

console.log('🕌 BarakahKu Service Worker loaded');