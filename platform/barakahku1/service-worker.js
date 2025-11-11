// ====================================================
// 🔥 BarakahKu - Complete Service Worker
// PWA + Firebase Cloud Messaging (All-in-One)
// Lokasi: /platform/barakahku1/service-worker.js
// ====================================================

// PWA Cache Configuration
const CACHE_NAME = 'barakahku-cache-v7';
const urlsToCache = [
  '/platform/barakahku1/',
  '/platform/barakahku1/index.html',
  '/platform/barakahku1/app.js',
  '/platform/barakahku1/manifest.json',
  '/platform/barakahku1/assets/icons/icon-192.png',
  '/platform/barakahku1/assets/icons/icon-512.png'
];

console.log('🚀 [SW] BarakahKu Service Worker starting...');

// ====================================================
// FIREBASE CLOUD MESSAGING (v8 Legacy)
// ====================================================
try {
  // Import Firebase v8 SDK
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

  // Initialize Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
    authDomain: "barakahku-app.firebaseapp.com",
    projectId: "barakahku-app",
    storageBucket: "barakahku-app.firebasestorage.app",
    messagingSenderId: "510231053293",
    appId: "1:510231053293:web:921b9e574fc614492b5de4"
  });

  const messaging = firebase.messaging();
  console.log('✅ [SW] Firebase Messaging initialized');

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('📩 [SW] Background message:', payload);
    
    const title = payload.notification?.title || 'BarakahKu';
    const options = {
      body: payload.notification?.body || 'Notifikasi baru',
      icon: '/platform/barakahku1/assets/icons/icon-192.png',
      badge: '/platform/barakahku1/assets/icons/icon-192.png',