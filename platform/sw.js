// sw.js — Service Worker Emydn Langit

const CACHE_NAME = 'emydn-langit-v1';
const urlsToCache = [
  '/platform/',
  '/platform/index.html',
  '/platform/manifest.json',
  '/platform/js/dataHandler.js',
  '/platform/js/stats.js',
  '/platform/js/prayerTimes.js',
  '/platform/css/style.css',
  '/platform/icons/icon-192.png',
  '/platform/icons/icon-512.png'
];

// Install event - cache semua file penting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching assets...');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - ambil dari cache dulu, lalu update
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((resp) => {
          return resp;
        })
      );
    })
  );
});

// Activate event - hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
