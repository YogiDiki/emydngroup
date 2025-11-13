// ==============================
// BarakahKu - app.js v33 (FIXED: Permission Display)
// ==============================
console.log('📦 [APP] Loading v33...');

// ====================================================
// FIREBASE MESSAGING
// ====================================================
let fcmInit = false;
let fcmInitInProgress = false;

async function initFCM() {
  if (fcmInit || fcmInitInProgress) {
    console.log('⚠️ [FCM] Already initialized or in progress');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('⚠️ [FCM] Permission not granted');
    return;
  }
  
  fcmInitInProgress = true;
  
  try {
    const swReg = await navigator.serviceWorker.getRegistration('/platform/barakahku1/')
       || await navigator.serviceWorker.ready;
    
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 3000);
      const mc = new MessageChannel();
      mc.port1.onmessage = (e) => { 
        if (e.data.ready) { 
          clearTimeout(timeout); 
          resolve(); 
        } 
      };
      swReg.active?.postMessage({ type: 'CHECK_FIREBASE' }, [mc.port2]);
    });
    
    if (!window.firebase?.messaging) {
      await new Promise((resolve, reject) => {
        const s1 = document.createElement('script');
        s1.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        s1.onload = () => {
          const s2 = document.createElement('script');
          s2.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js';
          s2.onload = resolve;
          s2.onerror = reject;
          document.head.appendChild(s2);
        };
        s1.onerror = reject;
        document.head.appendChild(s1);
      });
    }
    
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
        authDomain: "barakahku-app.firebaseapp.com",
        projectId: "barakahku-app",
        storageBucket: "barakahku-app.appspot.com",
        messagingSenderId: "510231053293",
        appId: "1:510231053293:web:921b9e574fc614492b5de4"
      });
    }
    
    const messaging = firebase.messaging();
    const token = await messaging.getToken({ 
      vapidKey: 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM',
      serviceWorkerRegistration: swReg
    });
    
    if (token) {
      localStorage.setItem('fcm_token', JSON.stringify({
        token,
        timestamp: new Date().toLocaleString('id-ID'),
        platform: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      }));
      console.log('✅ [FCM] Token:', token);
    }
    
    messaging.onMessage((payload) => {
      console.log('📩 [FCM] Foreground message:', payload);
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'BarakahKu', {
          body: payload.notification?.body || 'Notifikasi baru',
          icon: '/platform/barakahku1/assets/icons/icon-192.png',
          tag: 'barakahku-fcm',
          vibrate: [200, 100, 200]
        });
      }
    });
    
    fcmInit = true;
    console.log('✅ [FCM] Initialized successfully');
    
  } catch (err) {
    console.error('❌ [FCM] Error:', err.message);
    fcmInit = false;
  } finally {
    fcmInitInProgress = false;
  }
}

// ====================================================
// ALPINE.JS
// ====================================================

document.addEventListener('alpine:init', () => {
  console.log('🎨 [ALPINE] Initializing data...');
  
  Alpine.data('app', () => ({
    activeTab: 'beranda',
    showSearch: false,
    quran: [],
    currentSurah: null,
    currentDoa: null,
    doaList: [],
    selectedDoaCategory: null,  // ← TAMBAH INI
    doaCategories: [] ,           // ← TAMBAH INI (array 10 kategori)
    murotalList: [],
    jadwal: {},
    cityName: 'Memuat...',
    hijriDate: 'Memuat...',
    darkMode: false,
    lastRead: null,
    nearbyMosques: [],
    loadingMosques: false,
    userCoords: null,
    currentMood: null,
    notificationStatus: 'inactive',
    loadingQuran: true,
    loadingMurottal: true,

    moodSuggestions: {
      sedih: { ayat: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', arti: 'Sesungguhnya bersama kesulitan ada kemudahan', ref: 'QS. Al-Insyirah: 6' },
      senang: { ayat: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ', arti: 'Dan terhadap nikmat Tuhanmu, hendaklah kamu nyatakan', ref: 'QS. Ad-Duha: 11' },
      cemas: { ayat: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', arti: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram', ref: 'QS. Ar-Ra\'d: 28' },
      syukur: { ayat: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', arti: 'Jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu', ref: 'QS. Ibrahim: 7' },
      lelah: { ayat: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا', arti: 'Janganlah kamu lemah dan jangan pula bersedih hati', ref: 'QS. Ali Imran: 139' }
    },

    checklist: [
      { id: 1, name: 'Sholat Subuh', description: 'Sholat wajib 2 rakaat', icon: '🌅', done: false },
      { id: 2, name: 'Sholat Dzuhur', description: 'Sholat wajib 4 rakaat', icon: '☀️', done: false },
      { id: 3, name: 'Sholat Ashar', description: 'Sholat wajib 4 rakaat', icon: '🌤️', done: false },
      { id: 4, name: 'Sholat Maghrib', description: 'Sholat wajib 3 rakaat', icon: '🌆', done: false },
      { id: 5, name: 'Sholat Isya', description: 'Sholat wajib 4 rakaat', icon: '🌙', done: false },
      { id: 6, name: 'Dzikir Pagi', description: 'Dzikir setelah subuh', icon: '📿', done: false },
      { id: 7, name: 'Dzikir Sore', description: 'Dzikir setelah ashar', icon: '📿', done: false },
      { id: 8, name: 'Baca Al-Quran', description: 'Minimal 1 halaman', icon: '📖', done: false },
      { id: 9, name: 'Sedekah', description: 'Berbagi kepada yang membutuhkan', icon: '💝', done: false },
      { id: 10, name: 'Doa Malam', description: 'Doa sebelum tidur', icon: '🌛', done: false }
    ],

    init() {
      console.log('🚀 [APP] Starting v33...');
      
      // ✅ FIXED: Check notification status on init
      this.updateNotificationStatus();
      
      this.registerSW();
      this.loadQuran();
      this.loadDoa();
      this.loadChecklist();
      this.loadMurotalList();
      this.loadJadwal();
      this.loadLastRead();
      this.initDarkMode();
      
      document.addEventListener('play', (e) => {
        document.querySelectorAll('audio').forEach(a => { if (a !== e.target) a.pause(); });
      }, true);
      
      console.log('✅ [APP] Ready v33');
    },

    // ✅ NEW: Update status dari browser API langsung
    updateNotificationStatus() {
      if (!('Notification' in window)) {
        this.notificationStatus = 'unsupported';
        console.log('⚠️ [NOTIF] Browser tidak support');
        return;
      }
      
      // ✅ ALWAYS read from Notification.permission (TIDAK dari localStorage)
      const perm = Notification.permission;
      console.log('🔔 [NOTIF] Browser permission:', perm);
      
      if (perm === 'granted') {
        this.notificationStatus = 'active';
        console.log('✅ [NOTIF] Permission granted - Auto-init FCM');
        
        // Silent init FCM di background (tidak show notification)
        if (!fcmInit && !fcmInitInProgress) {
          setTimeout(() => initFCM(), 2000);
        }
      } else if (perm === 'denied') {
        this.notificationStatus = 'denied';
        console.log('❌ [NOTIF] Permission denied');
      } else {
        this.notificationStatus = 'inactive';
        console.log('ℹ️ [NOTIF] Permission default (not determined)');
      }
    },

    async loadQuran() {
      this.loadingQuran = true;
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        this.quran = data.data.map(s => ({
          nomor: s.nomor,
          namaLatin: s.namaLatin,
          arti: s.arti,
          jumlahAyat: s.jumlahAyat
        }));
        console.log('✅ Loaded', this.quran.length, 'surahs');
      } catch (err) {
        console.error('❌ Quran:', err);
        this.quran = [{ nomor: 1, namaLatin: 'Al-Fatihah', arti: 'Pembukaan', jumlahAyat: 7 }];
      } finally {
        this.loadingQuran = false;
      }
    },

    async loadSurah(nomor) {
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        const data = await res.json();
        this.currentSurah = {
          nomor,
          namaLatin: data.data.namaLatin,
          ayat: data.data.ayat.map(a => ({
            nomorAyat: a.nomorAyat,
            arab: a.teksArab,
            latin: a.teksLatin,
            teks: a.teksIndonesia
          }))
        };
        this.lastRead = { surah: nomor, namaLatin: data.data.namaLatin, ayat: 1, timestamp: new Date().toLocaleString('id-ID') };
        localStorage.setItem('lastRead', JSON.stringify(this.lastRead));
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } catch (err) {
        console.error('❌ Surah:', err);
      }
    },

async loadDoa() {
  try {
    const res = await fetch('/platform/barakahku1/data/doa.json');
    const data = await res.json();
    this.doaList = data.map((d, i) => ({
      id: i + 1,
      judul: d.judul,
      arab: d.arab,
      latin: d.latin,
      arti: d.arti,
      terjemah: d.terjemah || d.arti,
      sumber: d.sumber || '',        // ← ADA KOMA DI SINI
      kategori: d.kategori || 'umum'  // ← TAMBAH BARIS INI
    }));
    console.log('✅ [DOA] Loaded', this.doaList.length, 'doa dari doa.json');
  } catch (err) {
    console.error('❌ [DOA] Gagal memuat doa.json:', err);
    this.doaList = [];
  }
},

get filteredDoaList() {
  if (!this.selectedDoaCategory) return this.doaList;
  return this.doaList.filter(doa => doa.kategori === this.selectedDoaCategory.id);
},

selectDoaCategory(category) {
  this.selectedDoaCategory = category;
  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
},

backFromDoaDetail() {
  this.currentDoa = null;
  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
},

    async loadMurotalList() {
      this.loadingMurottal = true;

      const cached = localStorage.getItem('murotalCache');
      const cacheTime = localStorage.getItem('murotalCacheTime');
      const cacheValid = cacheTime && (Date.now() - parseInt(cacheTime) < 1000 * 60 * 60 * 6);

      if (cached && cacheValid) {
        try {
          this.murotalList = JSON.parse(cached);
          console.log('⚡ [MUROTTAL] Loaded from cache:', this.murotalList.length);
          this.loadingMurottal = false;
          this.prefetchMurottal();
          return;
        } catch (e) {
          console.warn('⚠️ Cache murottal corrupt, refetching...');
        }
      }

      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        this.murotalList = data.data.map(s => ({
          id: s.nomor,
          nomor: s.nomor,
          judul: `${s.namaLatin} - ${s.nama}`,
          qari: 'Mishari Rashid Al-Afasy',
          audio: s.audioFull?.['05'] || s.audioFull?.['01'] || ''
        }));

        localStorage.setItem('murotalCache', JSON.stringify(this.murotalList));
        localStorage.setItem('murotalCacheTime', Date.now().toString());
        console.log('✅ [MUROTTAL] Cached', this.murotalList.length, 'items');
      } catch (err) {
        console.error('❌ [MUROTTAL] Load error:', err);
        this.murotalList = [];
      } finally {
        this.loadingMurottal = false;
      }
    },

    async prefetchMurottal() {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        const freshList = data.data.map(s => ({
          id: s.nomor,
          nomor: s.nomor,
          judul: `${s.namaLatin} - ${s.nama}`,
          qari: 'Mishari Rashid Al-Afasy',
          audio: s.audioFull?.['05'] || s.audioFull?.['01'] || ''
        }));
        localStorage.setItem('murotalCache', JSON.stringify(freshList));
        localStorage.setItem('murotalCacheTime', Date.now().toString());
        console.log('🌀 [MUROTTAL] Prefetch updated cache');
      } catch (err) {
        console.warn('⚠️ [MUROTTAL] Prefetch failed:', err.message);
      }
    },

    async loadJadwal() {
      if (!navigator.geolocation) return;
      
      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        this.userCoords = { latitude, longitude };
        
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const geoData = await geoRes.json();
          this.cityName = geoData.address.city || geoData.address.town || geoData.address.county || geoData.address.state || 'Lokasi Anda';
          
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
          const data = await res.json();
          this.jadwal = data.data.timings;
          
          if (data.data.date?.hijri) {
            const hijri = data.data.date.hijri;
            this.hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
          }
          
          this.checkAutoDarkMode();
        } catch (err) {
          console.error('❌ Jadwal:', err);
          this.cityName = 'Gagal memuat';
        }
      });
    },

    loadChecklist() {
      const saved = localStorage.getItem('checklist');
      if (saved) this.checklist = JSON.parse(saved);
      
      const lastDate = localStorage.getItem('checklistDate');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        this.checklist.forEach(i => i.done = false);
        localStorage.setItem('checklistDate', today);
        this.saveChecklist();
      }
    },

    saveChecklist() {
      localStorage.setItem('checklist', JSON.stringify(this.checklist));
    },

    bookmarkAyat(nomorAyat) {
      let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const key = `${this.currentSurah.namaLatin}-${nomorAyat}`;
      if (!bookmarks.includes(key)) {
        bookmarks.push(key);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        alert(`✅ Ayat ${nomorAyat} tersimpan! 🔖`);
      } else {
        alert('ℹ️ Ayat sudah tersimpan');
      }
    },

    installApp() {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((r) => {
          if (r.outcome === 'accepted') console.log('✅ Installed');
          window.deferredPrompt = null;
        });
      } else {
        alert('ℹ️ Aplikasi sudah terinstall atau browser tidak mendukung PWA');
      }
    },

    // ✅ Request permission - hanya saat user klik button
    async requestNotificationPermission() {
      console.log('🔔 [PERMISSION] User clicked request button');
      
      if (!('Notification' in window)) {
        alert('❌ Browser Anda tidak mendukung notifikasi');
        this.notificationStatus = 'unsupported';
        return;
      }

      const currentPerm = Notification.permission;
      console.log('🔔 [PERMISSION] Current:', currentPerm);

      if (currentPerm === 'granted') {
        this.notificationStatus = 'active';
        alert('✅ Notifikasi sudah aktif!\n\nAnda akan menerima pengingat waktu sholat.');
        
        if (!fcmInit && !fcmInitInProgress) {
          setTimeout(() => initFCM(), 1000);
        }
        return;
      }

      if (currentPerm === 'denied') {
        this.notificationStatus = 'denied';
        alert('❌ Notifikasi diblokir di browser.\n\n📱 Cara mengaktifkan:\n\n1. Tap ikon 🔒 di address bar\n2. Pilih "Site settings" atau "Permissions"\n3. Cari "Notifications"\n4. Ubah ke "Allow"\n5. Refresh halaman');
        return;
      }

      // Request permission
      try {
        console.log('🔔 [PERMISSION] Requesting...');
        
        const permission = await Notification.requestPermission();
        console.log('🔔 [PERMISSION] Result:', permission);
        
        if (permission === 'granted') {
          this.notificationStatus = 'active';
          
          // Show success notification
          new Notification('BarakahKu', {
            body: '✅ Notifikasi berhasil diaktifkan! Anda akan menerima pengingat waktu sholat.',
            icon: '/platform/barakahku1/assets/icons/icon-192.png',
            badge: '/platform/barakahku1/assets/icons/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'barakahku-success'
          });
          
          // Init FCM
          setTimeout(() => initFCM(), 2000);
          
        } else if (permission === 'denied') {
          this.notificationStatus = 'denied';
          alert('❌ Izin notifikasi ditolak.\n\nAnda dapat mengaktifkannya kembali di pengaturan browser.');
        } else {
          this.notificationStatus = 'inactive';
          console.log('ℹ️ Permission dismissed');
        }
        
      } catch (error) {
        console.error('❌ [PERMISSION] Error:', error);
        this.notificationStatus = 'denied';
        alert('❌ Terjadi kesalahan saat meminta izin notifikasi.\n\nCoba refresh halaman dan ulangi.');
      }
    },

    async registerSW() {
      if (!('serviceWorker' in navigator)) return;
      
      try {
        const reg = await navigator.serviceWorker.register('/platform/barakahku1/service-worker.js', { 
          scope: '/platform/barakahku1/',
          updateViaCache: 'none'
        });
        console.log('✅ [SW] Registered');
        
        navigator.serviceWorker.addEventListener('message', (e) => {
          if (e.data?.type === 'SW_READY') console.log('✅ [SW] Firebase ready');
        });
        
        await navigator.serviceWorker.ready;
        console.log('✅ [SW] Ready');
      } catch (err) {
        console.error('❌ [SW]:', err.message);
      }
    },

    loadLastRead() {
      const saved = localStorage.getItem('lastRead');
      if (saved) this.lastRead = JSON.parse(saved);
    },

    continueReading() {
      if (this.lastRead?.surah) {
        this.activeTab = 'quran';
        setTimeout(() => this.loadSurah(this.lastRead.surah), 100);
      }
    },

    async findNearbyMosques() {
      if (!this.userCoords) return alert('📍 Aktifkan lokasi terlebih dahulu');
      
      this.loadingMosques = true;
      this.nearbyMosques = [];
      
      try {
        const { latitude, longitude } = this.userCoords;
        const query = `[out:json];(node["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${latitude},${longitude});way["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${latitude},${longitude}););out body;`;
        const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
        const data = await res.json();
        
        this.nearbyMosques = data.elements
          .filter(el => el.tags?.name)
          .map(el => ({
            name: el.tags.name,
            address: el.tags['addr:full'] || el.tags['addr:street'] || 'Alamat tidak tersedia',
            lat: el.lat || el.center?.lat,
            lon: el.lon || el.center?.lon,
            distance: this.calculateDistance(latitude, longitude, el.lat || el.center?.lat, el.lon || el.center?.lon).toFixed(2)
          }))
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .slice(0, 10);
        
        if (!this.nearbyMosques.length) alert('ℹ️ Tidak ada masjid dalam radius 2km');
      } catch (err) {
        console.error('❌ Masjid:', err);
        alert('❌ Gagal mencari masjid');
      } finally {
        this.loadingMosques = false;
      }
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    },

    openGoogleMaps(lat, lon, name) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(name)}`, '_blank');
    },

    setMood(mood) { this.currentMood = mood; },
    clearMood() { this.currentMood = null; },

    initDarkMode() {
      this.darkMode = localStorage.getItem('darkMode') === 'true';
      document.documentElement.classList.toggle('dark', this.darkMode);
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      document.documentElement.classList.toggle('dark', this.darkMode);
      localStorage.setItem('darkMode', this.darkMode);
    },

    checkAutoDarkMode() {
      if (this.jadwal.Maghrib && this.jadwal.Fajr) {
        const now = new Date().getHours() * 60 + new Date().getMinutes();
        const [mH, mM] = this.jadwal.Maghrib.split(':').map(Number);
        const [fH, fM] = this.jadwal.Fajr.split(':').map(Number);
        const isNight = now >= (mH * 60 + mM) || now < (fH * 60 + fM);
        if (isNight && !this.darkMode) console.log('🌙 Malam hari');
      }
    }

  }));
  
  console.log('✅ [ALPINE] Data registered');
});

// ====================================================
// PWA
// ====================================================

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

console.log('✅ [APP] Loaded v33');