// ==============================
// BarakahKu - app.js (FIXED FCM - Better Timing!)
// ==============================

console.log('📦 [APP] Loading app.js...');

// ------------------------------
// Fungsi inisialisasi Firebase Messaging - ROBUST VERSION WITH BETTER TIMING!
// ------------------------------
let fcmInitializing = false;
let fcmInitialized = false;
let swReadyListener = null;

async function initFirebaseMessaging() {
  // ✅ Prevent double initialization
  if (fcmInitializing || fcmInitialized) {
    console.log('⚠️ [FCM] Already initializing/initialized, skipping...');
    return;
  }
  fcmInitializing = true;
  
  try {
    console.log('🔔 [FCM] Mulai inisialisasi...');
    
    if (Notification.permission !== 'granted') {
      console.log('⚠️ [FCM] Notifikasi belum diizinkan');
      fcmInitializing = false;
      return;
    }

    // ✅ STEP 1: Wait for Service Worker with better strategy
    console.log('⏳ [FCM] Waiting for Service Worker...');
    
    let swRegistration;
    
    // Strategy 1: Try to get existing registration first
    const existingReg = await navigator.serviceWorker.getRegistration('/platform/barakahku1/');
    
    if (existingReg && existingReg.active) {
      console.log('✅ [FCM] Found active SW registration');
      swRegistration = existingReg;
    } else {
      // Strategy 2: Wait for ready with extended timeout
      console.log('⏳ [FCM] Waiting for SW ready state...');
      swRegistration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SW ready timeout')), 10000) // 10s timeout
        )
      ]);
    }
    
    console.log('✅ [FCM] SW Ready! Scope:', swRegistration.scope);
    console.log('✅ [FCM] SW Active state:', swRegistration.active?.state);
    
    // ✅ STEP 1.5: Wait for SW_READY message from Service Worker
    console.log('⏳ [FCM] Waiting for SW_READY signal...');
    
    const swReadyPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ [FCM] SW_READY timeout, proceeding anyway...');
        resolve(); // Don't reject, just proceed
      }, 3000); // 3s timeout for ready signal
      
      // Listen for SW_READY message
      swReadyListener = (event) => {
        if (event.data && event.data.type === 'SW_READY') {
          console.log('✅ [FCM] Received SW_READY signal:', event.data);
          clearTimeout(timeout);
          navigator.serviceWorker.removeEventListener('message', swReadyListener);
          resolve();
        }
      };
      
      navigator.serviceWorker.addEventListener('message', swReadyListener);
      
      // Also check Firebase status via message channel
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        console.log('📨 [FCM] Firebase status check:', event.data);
        if (event.data.ready) {
          clearTimeout(timeout);
          if (swReadyListener) {
            navigator.serviceWorker.removeEventListener('message', swReadyListener);
          }
          resolve();
        }
      };
      
      swRegistration.active?.postMessage(
        { type: 'CHECK_FIREBASE' },
        [messageChannel.port2]
      );
    });
    
    await swReadyPromise;
    console.log('✅ [FCM] SW is ready, proceeding...');

    // ✅ STEP 2: Load Firebase SDK
    console.log('📦 [FCM] Starting Firebase SDK load...');
    if (!window.firebase || !window.firebase.messaging) {
      console.log('📦 [FCM] Firebase not loaded, loading now...');
      
      try {
        await Promise.race([
          new Promise((resolve, reject) => {
            console.log('📥 [FCM] Loading firebase-app.js...');
            const script1 = document.createElement('script');
            script1.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
            script1.onload = () => {
              console.log('✅ [FCM] firebase-app.js loaded');
              
              console.log('📥 [FCM] Loading firebase-messaging.js...');
              const script2 = document.createElement('script');
              script2.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js';
              script2.onload = () => {
                console.log('✅ [FCM] firebase-messaging.js loaded');
                console.log('✅ [FCM] Firebase SDK complete');
                resolve();
              };
              script2.onerror = (e) => {
                console.error('❌ [FCM] firebase-messaging.js failed:', e);
                reject(new Error('Failed to load firebase-messaging.js'));
              };
              document.head.appendChild(script2);
            };
            script1.onerror = (e) => {
              console.error('❌ [FCM] firebase-app.js failed:', e);
              reject(new Error('Failed to load firebase-app.js'));
            };
            document.head.appendChild(script1);
          }),
          new Promise((_, reject) => {
            setTimeout(() => {
              console.error('⏱️ [FCM] SDK load timeout!');
              reject(new Error('Firebase SDK load timeout after 15s'));
            }, 15000);
          })
        ]);
        
        console.log('✅ [FCM] Firebase SDK loaded successfully');
      } catch (err) {
        console.error('❌ [FCM] Firebase SDK load error:', err);
        throw err;
      }
    } else {
      console.log('✅ [FCM] Firebase SDK already loaded');
    }

    // ✅ STEP 3: Initialize Firebase App
    console.log('🔧 [FCM] Checking Firebase app...');
    if (!firebase.apps || firebase.apps.length === 0) {
      console.log('🔧 [FCM] Initializing Firebase app...');
      firebase.initializeApp({
        apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
        authDomain: "barakahku-app.firebaseapp.com",
        projectId: "barakahku-app",
        storageBucket: "barakahku-app.appspot.com",
        messagingSenderId: "510231053293",
        appId: "1:510231053293:web:921b9e574fc614492b5de4"
      });
      console.log('✅ [FCM] Firebase app initialized');
    } else {
      console.log('✅ [FCM] Firebase app already initialized');
    }
    
    console.log('📊 [FCM] Firebase apps count:', firebase.apps.length);

    // ✅ STEP 4: Get Messaging instance
    console.log('📱 [FCM] Getting messaging instance...');
    const messaging = firebase.messaging();
    console.log('✅ [FCM] Messaging instance created');
    
    // ✅ STEP 5: Get token with timeout protection
    console.log('🔑 [FCM] Getting token with custom SW...');
    
    const tokenPromise = messaging.getToken({ 
      vapidKey: 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM',
      serviceWorkerRegistration: swRegistration
    });
    
    const currentToken = await Promise.race([
      tokenPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Token request timeout after 20s')), 20000) // Extended to 20s
      )
    ]);
    
    if (currentToken) {
      console.log('🔑 [FCM] Token berhasil!');
      console.log('📋 Token:', currentToken);
      
      const tokenInfo = {
        token: currentToken,
        timestamp: new Date().toLocaleString('id-ID'),
        platform: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      };
      localStorage.setItem('fcm_token', JSON.stringify(tokenInfo));
      console.log('💾 [FCM] Token tersimpan');
      
      alert('🎉 FCM Token berhasil!\n\n✅ Token: ' + currentToken.substring(0, 50) + '...\n\n📲 Anda akan menerima notifikasi untuk:\n• Pengingat sholat\n• Notifikasi ibadah\n• Pesan motivasi\n\n💡 Token telah disimpan di localStorage');
      
      fcmInitialized = true;
      
    } else {
      console.warn('⚠️ [FCM] Tidak dapat token');
      alert('⚠️ Token tidak ditemukan.\n\nPastikan:\n1. Service Worker aktif\n2. Notifikasi diizinkan\n3. Refresh dan coba lagi\n\n🔧 Cek Console untuk detail error');
    }

    // ✅ STEP 6: Handler foreground messages
    messaging.onMessage((payload) => {
      console.log('📩 [FCM] Foreground message:', payload);
      
      const title = payload?.notification?.title || 'BarakahKu';
      const body = payload?.notification?.body || 'Notifikasi baru';
      
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/platform/barakahku1/assets/icons/icon-192.png',
          badge: '/platform/barakahku1/assets/icons/icon-192.png',
          tag: 'barakahku-fcm',
          vibrate: [200, 100, 200],
          data: payload.data || {}
        });
      }
    });

    console.log('✅ [FCM] Setup complete!');

  } catch (error) {
    console.error('❌ [FCM] Init failed:', error);
    console.error('❌ [FCM] Error name:', error.name);
    console.error('❌ [FCM] Error code:', error.code);
    console.error('❌ [FCM] Error message:', error.message);
    console.error('❌ [FCM] Stack:', error.stack);
    
    let errorMsg = '❌ Gagal menginisialisasi notifikasi.\n\n';
    
    if (error.message.includes('timeout')) {
      errorMsg += '⏱️ Timeout!\n\nKemungkinan:\n1. Koneksi internet lambat\n2. Service Worker belum siap\n3. Firebase server lambat\n\n💡 Solusi:\n• Tunggu 10-15 detik lalu coba lagi\n• Pastikan koneksi internet stabil\n• Hard refresh (Ctrl+Shift+R)\n• Buka Console untuk detail';
    } else if (error.code === 'messaging/failed-service-worker-registration') {
      errorMsg += '❌ Service Worker gagal.\n\nSolusi:\n1. Pastikan HTTPS aktif\n2. Cek console untuk error SW\n3. Hard refresh (Ctrl+Shift+R)\n4. Clear cache browser';
    } else if (error.code === 'messaging/token-subscribe-failed') {
      errorMsg += '❌ Gagal subscribe token.\n\nSolusi:\n1. Periksa VAPID key\n2. Periksa Firebase config\n3. Coba unregister SW lalu register ulang';
    } else if (error.message && error.message.includes('supported')) {
      errorMsg += '❌ Browser tidak mendukung notifikasi.\n\nGunakan:\n• Chrome/Edge versi terbaru\n• Firefox versi terbaru';
    } else {
      errorMsg += '🔧 Error: ' + error.message + '\n\n💡 Coba:\n1. Refresh halaman\n2. Clear cache & cookies\n3. Aktifkan ulang notifikasi\n4. Lihat Console untuk detail';
    }
    
    alert(errorMsg);
  } finally {
    fcmInitializing = false;
    // Clean up listener
    if (swReadyListener) {
      navigator.serviceWorker.removeEventListener('message', swReadyListener);
      swReadyListener = null;
    }
  }
}

// ==============================
// ALPINE.JS DATA REGISTRATION
// ==============================
document.addEventListener('alpine:init', () => {
  console.log('🎨 [ALPINE] Registering app component...');
  
  Alpine.data('app', () => ({
    _initialized: false,
    activeTab: 'beranda',
    showSearch: false,
    quran: [],
    currentSurah: null,
    doaList: [],
    currentDoa: null,
    murotalList: [],
    jadwal: {},
    cityName: 'Memuat lokasi...',
    hijriDate: 'Memuat tanggal Hijriah...',
    darkMode: false,
    lastRead: null,
    nearbyMosques: [],
    loadingMosques: false,
    userCoords: null,
    currentMood: null,
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
      if (this._initialized) {
        console.log('⚠️ [APP] Already initialized, skipping...');
        return;
      }
      this._initialized = true;
      
      console.log('🚀 [APP] BarakahKu - Memulai aplikasi...');
      console.log('📊 [APP] Alpine.js version:', Alpine.version);
      
      this.registerServiceWorker();
      
      console.log('📖 [APP] Loading Quran...');
      this.loadQuran();
      
      console.log('🙏 [APP] Loading Doa...');
      this.loadDoa();
      
      console.log('✅ [APP] Loading Checklist...');
      this.loadChecklist();
      
      console.log('🎵 [APP] Loading Murottal...');
      this.loadMurotalList();
      
      console.log('📍 [APP] Loading Jadwal...');
      this.loadJadwal();
      
      console.log('📖 [APP] Loading Last Read...');
      this.loadLastRead();
      
      console.log('🌑 [APP] Init Dark Mode...');
      this.initDarkMode();

      document.addEventListener('play', function (e) {
        const audios = document.getElementsByTagName('audio');
        for (let i = 0; i < audios.length; i++) {
          if (audios[i] !== e.target) {
            audios[i].pause();
          }
        }
      }, true);

      console.log('✅ [APP] Aplikasi siap');
    },

    async loadQuran() {
      try {
        console.log('📖 [API] Fetching surah...');
        const res = await fetch('https://equran.id/api/v2/surat');
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('📦 [API] Response received:', data);
        
        if (!data || !data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response structure');
        }
        
        this.quran = data.data.map(s => ({
          nomor: s.nomor,
          namaLatin: s.namaLatin,
          arti: s.arti,
          jumlahAyat: s.jumlahAyat
        }));
        
        console.log(`✅ [APP] ${this.quran.length} surah dimuat`);
      } catch (err) {
        console.error('❌ [APP] Error load Quran:', err);
        console.error('Stack:', err.stack);
        this.quran = [
          { nomor: 1, namaLatin: 'Al-Fatihah', arti: 'Pembukaan', jumlahAyat: 7 }
        ];
      }
    },

    async loadSurah(nomor) {
      try {
        console.log(`📖 [API] Buka surah ${nomor}...`);
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📦 [API] Surah data:', data);
        
        this.currentSurah = {
          nomor: nomor,
          namaLatin: data.data.namaLatin,
          ayat: data.data.ayat.map(a => ({
            nomorAyat: a.nomorAyat,
            arab: a.teksArab,
            latin: a.teksLatin,
            teks: a.teksIndonesia
          }))
        };
        
        this.lastRead = {
          surah: nomor,
          namaLatin: data.data.namaLatin,
          ayat: 1,
          timestamp: new Date().toLocaleString('id-ID')
        };
        localStorage.setItem('lastRead', JSON.stringify(this.lastRead));
        
        console.log(`✅ [APP] Surah ${data.data.namaLatin} dimuat`);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } catch (err) {
        console.error('❌ [APP] Error load surah:', err);
      }
    },

    loadDoa() {
      console.log('🙏 [APP] Memuat doa...');
      this.doaList = [
        {
          id: 1,
          judul: 'Doa Sebelum Makan',
          arab: 'بِسْمِ اللهِ وَعَلَى بَرَكَةِ اللهِ',
          latin: 'Bismillahi wa \'ala barakatillah',
          terjemah: 'Dengan menyebut nama Allah dan atas berkah Allah'
        },
        {
          id: 2,
          judul: 'Doa Sesudah Makan',
          arab: 'اَلْحَمْدُ ِللهِ الَّذِىْ اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ',
          latin: 'Alhamdulillahilladzi ath\'amana wasaqona waja\'alana muslimin',
          terjemah: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim'
        },
        {
          id: 3,
          judul: 'Doa Bangun Tidur',
          arab: 'اَلْحَمْدُ ِللهِ الَّذِيْ اَحْيَانَا بَعْدَمَآ اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ',
          latin: 'Alhamdu lillahil ladzi ahyana ba\'da ma amatana wa ilaihin nusyur',
          terjemah: 'Segala puji bagi Allah yang telah menghidupkan kami sesudah kami mati dan hanya kepada-Nya kami kembali'
        },
        {
          id: 4,
          judul: 'Doa Sebelum Tidur',
          arab: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
          latin: 'Bismika Allahumma amuutu wa ahyaa',
          terjemah: 'Dengan nama-Mu ya Allah aku mati dan aku hidup'
        },
        {
          id: 5,
          judul: 'Doa Masuk Kamar Mandi',
          arab: 'اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِِ وَالْخَبَائِثِ',
          latin: 'Allahumma inni a\'udzu bika minal khubutsi wal khaba\'its',
          terjemah: 'Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan perempuan'
        },
        {
          id: 6,
          judul: 'Doa Keluar Kamar Mandi',
          arab: 'غُفْرَانَكَ',
          latin: 'Ghufraanaka',
          terjemah: 'Aku mohon ampunan-Mu'
        },
        {
          id: 7,
          judul: 'Doa Masuk Masjid',
          arab: 'اَللَّهُمَّ افْتَحْ لِيْ أَبْوَابَ رَحْمَتِكَ',
          latin: 'Allahummaftah lii abwaaba rahmatika',
          terjemah: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu'
        },
        {
          id: 8,
          judul: 'Doa Keluar Masjid',
          arab: 'اَللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
          latin: 'Allahumma inni as\'aluka min fadhlika',
          terjemah: 'Ya Allah, sesungguhnya aku mohon kepada-Mu dari karunia-Mu'
        },
        {
          id: 9,
          judul: 'Doa Memakai Pakaian',
          arab: 'اَلْحَمْدُ لِلَّهِ الَّذِيْ كَسَانِيْ هَذَا وَرَزَقَنِيْهِ مِنْ غَيْرِ حَوْلٍ مِنِّيْ وَلاَ قُوَّةٍ',
          latin: 'Alhamdu lillahil ladzi kasani hadza wa razaqanihi min ghairi haulin minni wa laa quwwata',
          terjemah: 'Segala puji bagi Allah yang memberi aku pakaian ini dan memberi rizki kepadaku tanpa daya dan kekuatan dariku'
        },
        {
          id: 10,
          judul: 'Doa Ketika Turun Hujan',
          arab: 'اَللَّهُمَّ صَيِّبًا نَافِعًا',
          latin: 'Allahumma shayyiban naafi\'aa',
          terjemah: 'Ya Allah, turunkanlah hujan yang bermanfaat'
        }
      ];
      console.log(`✅ [APP] ${this.doaList.length} doa dimuat`);
    },

    async loadMurotalList() {
      try {
        console.log('🎵 [API] Fetching murottal...');
        const res = await fetch('https://equran.id/api/v2/surat');
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📦 [API] Murottal response:', data);

        this.murotalList = data.data.map(s => {
          let audioUrl = '';
          if (s.audioFull && s.audioFull['05']) {
            audioUrl = s.audioFull['05'];
          } else if (s.audioFull && s.audioFull['01']) {
            audioUrl = s.audioFull['01'];
          }

          return {
            id: s.nomor,
            nomor: s.nomor,
            judul: s.namaLatin + ' - ' + s.nama,
            qari: 'Mishari Rashid Al-Afasy',
            audio: audioUrl
          };
        });

        console.log(`✅ [APP] ${this.murotalList.length} murottal dimuat`);
      } catch (err) {
        console.error('❌ [APP] Error murottal:', err);
        this.murotalList = [];
      }
    },

    async loadJadwal() {
      if (!navigator.geolocation) {
        this.cityName = 'Lokasi tidak tersedia';
        this.hijriDate = 'Tanggal tidak tersedia';
        return;
      }

      console.log('📍 [APP] Get lokasi...');
      this.cityName = 'Mendapatkan lokasi...';
      this.hijriDate = 'Memuat tanggal...';

      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        this.userCoords = { latitude, longitude };
        console.log(`📍 [APP] Koordinat: ${latitude}, ${longitude}`);

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          
          if (!geoRes.ok) {
            throw new Error(`Geolocation HTTP ${geoRes.status}`);
          }
          
          const geoData = await geoRes.json();
          console.log('📦 [API] Geo data:', geoData);

          this.cityName = geoData.address.city ||
                          geoData.address.town ||
                          geoData.address.county ||
                          geoData.address.state ||
                          'Lokasi Anda';

          console.log(`📍 [APP] Kota: ${this.cityName}`);

          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
          
          if (!res.ok) {
            throw new Error(`Aladhan HTTP ${res.status}`);
          }
          
          const data = await res.json();
          console.log('📦 [API] Jadwal data:', data);
          
          this.jadwal = data.data.timings;
          
          if (data.data.date && data.data.date.hijri) {
            const hijri = data.data.date.hijri;
            this.hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
            console.log(`📅 [APP] Hijriah: ${this.hijriDate}`);
          }

          this.checkAutoDarkMode();

          console.log('✅ [APP] Jadwal sholat dimuat');
        } catch (err) {
          console.error('❌ [APP] Error jadwal:', err);
          this.cityName = 'Gagal memuat lokasi';
          this.hijriDate = 'Gagal memuat tanggal';
        }
      }, err => {
        console.error('❌ [APP] Error lokasi:', err);
        this.cityName = 'Lokasi ditolak';
        this.hijriDate = 'Tanggal tidak tersedia';
      });
    },

    loadChecklist() {
      const saved = localStorage.getItem('checklist');
      if (saved) {
        try {
          this.checklist = JSON.parse(saved);
          console.log('✅ [APP] Checklist loaded from localStorage');
        } catch (e) {
          console.error('❌ [APP] Error checklist:', e);
        }
      }

      const lastDate = localStorage.getItem('checklistDate');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        this.checklist.forEach(item => item.done = false);
        localStorage.setItem('checklistDate', today);
        this.saveChecklist();
        console.log('✅ [APP] Checklist reset untuk hari baru');
      }
    },

    saveChecklist() {
      try {
        localStorage.setItem('checklist', JSON.stringify(this.checklist));
        console.log('💾 [APP] Checklist saved');
      } catch (e) {
        console.error('❌ [APP] Error save:', e);
      }
    },

    bookmarkAyat(nomorAyat) {
      try {
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const key = `${this.currentSurah.namaLatin}-${nomorAyat}`;

        if (!bookmarks.includes(key)) {
          bookmarks.push(key);
          localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
          alert(`✅ Ayat ${nomorAyat} tersimpan! 🔖`);
        } else {
          alert('ℹ️ Ayat sudah tersimpan');
        }
      } catch (e) {
        console.error('❌ [APP] Error bookmark:', e);
      }
    },

    installApp() {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ [PWA] Install accepted');
          }
          window.deferredPrompt = null;
        });
      } else {
        alert('ℹ️ Aplikasi sudah terinstall atau browser tidak mendukung PWA.\n\nCara install:\n• Chrome Android: Menu → Install app\n• Safari iOS: Share → Add to Home Screen');
      }
    },

    async requestNotificationPermission() {
      if (Notification.permission === 'granted') {
        const saved = localStorage.getItem('fcm_token');
        if (saved) {
          const tokenInfo = JSON.parse(saved);
          alert('✅ Notifikasi sudah aktif!\n\n📋 Token: ' + tokenInfo.token.substring(0, 50) + '...\n\n⏰ Terakhir update: ' + tokenInfo.timestamp);
          console.log('💾 [FCM] Token tersimpan:', tokenInfo);
        } else {
          alert('⏳ Token belum ada. Menginisialisasi notifikasi...\n\nProses ini mungkin memakan waktu 10-20 detik.\n\nHarap tunggu...');
          await initFirebaseMessaging();
        }
        return;
      }
      
      if (Notification.permission === 'denied') {
        alert('❌ Izin notifikasi ditolak.\n\n🔧 Cara mengaktifkan:\n\n1. Klik ikon gembok 🔒 di address bar\n2. Cari "Notifications" atau "Notifikasi"\n3. Ubah ke "Allow" atau "Izinkan"\n4. Refresh halaman ini\n5. Klik tombol notifikasi lagi');
        return;
      }

      try {
        console.log('🔔 [APP] Requesting notification permission...');
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          alert('✅ Izin notifikasi diberikan!\n\n⏳ Sedang setup Firebase Cloud Messaging...\n\nProses ini mungkin memakan waktu 10-20 detik.\n\nHarap bersabar dan jangan tutup halaman ini.');
          
          // Give user time to read the alert
          setTimeout(async () => {
            await initFirebaseMessaging();
            
            // Check if token was saved successfully
            const saved = localStorage.getItem('fcm_token');
            if (saved) {
              console.log('✅ [APP] FCM setup berhasil');
            } else {
              console.warn('⚠️ [APP] FCM setup gagal, coba manual');
              alert('⚠️ Setup FCM belum selesai.\n\nSilakan cek Console untuk detail error.\n\nCoba:\n1. Refresh halaman\n2. Tunggu 10-15 detik\n3. Klik tombol notifikasi lagi');
            }
          }, 2000);
        } else if (permission === 'denied') {
          alert('❌ Anda menolak izin notifikasi.\n\nUntuk mengaktifkan kembali, ikuti langkah di atas.');
        } else {
          alert('⚠️ Izin notifikasi dibatalkan.\n\nSilakan coba lagi jika ingin menerima notifikasi.');
        }
      } catch (err) {
        console.error('❌ [APP] Error permission:', err);
        alert('❌ Gagal meminta izin: ' + err.message + '\n\nSilakan coba lagi atau cek Console untuk detail.');
      }
    },

    async registerServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ [SW] Service Worker tidak didukung');
        alert('⚠️ Browser Anda tidak mendukung Service Worker.\n\nGunakan browser modern:\n• Chrome 40+\n• Firefox 44+\n• Safari 11.1+\n• Edge 17+');
        return;
      }

      try {
        console.log('📝 [SW] Registering Service Worker...');
        
        // Don't unregister - just register directly
        const registration = await navigator.serviceWorker.register(
          '/platform/barakahku1/service-worker.js',
          { 
            scope: '/platform/barakahku1/',
            updateViaCache: 'none'
          }
        );
        
        console.log('✅ [SW] Service Worker registered');
        console.log('📍 [SW] Scope:', registration.scope);
        console.log('📊 [SW] Installing:', registration.installing ? 'Yes' : 'No');
        console.log('📊 [SW] Waiting:', registration.waiting ? 'Yes' : 'No');
        console.log('📊 [SW] Active:', registration.active ? 'Yes' : 'No');
        
        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('📨 [APP] Message from SW:', event.data);
          
          if (event.data && event.data.type === 'SW_READY') {
            console.log('✅ [APP] SW is ready and Firebase initialized');
          }
        });
        
        // Wait for SW to become active
        if (registration.installing) {
          console.log('⏳ [SW] SW is installing, waiting...');
          registration.installing.addEventListener('statechange', function() {
            if (this.state === 'activated') {
              console.log('✅ [SW] SW activated');
            }
          });
        }
        
        if (registration.waiting) {
          console.log('⏳ [SW] SW is waiting, activating...');
        }
        
        // Wait for ready state
        console.log('⏳ [SW] Waiting for SW ready state...');
        await navigator.serviceWorker.ready;
        console.log('✅ [SW] Service Worker ready');
        console.log('💡 [SW] FCM akan diinit saat user klik tombol notifikasi');
        
        // Handle SW updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 [SW] Update ditemukan');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ [SW] Update tersedia, reload untuk update');
              if (confirm('🔄 Update aplikasi tersedia!\n\nReload sekarang untuk mendapatkan versi terbaru?')) {
                window.location.reload();
              }
            }
          });
        });
        
      } catch (err) {
        console.error('❌ [SW] Registration failed:', err);
        console.error('❌ [SW] Error details:', err.message);
        alert('❌ Service Worker gagal register.\n\nError: ' + err.message + '\n\nPastikan:\n1. HTTPS aktif\n2. Browser mendukung SW\n3. Path file benar\n4. Cek Console untuk detail');
      }
    },

    loadLastRead() {
      const saved = localStorage.getItem('lastRead');
      if (saved) {
        try {
          this.lastRead = JSON.parse(saved);
          console.log('📖 [APP] Progress bacaan dimuat:', this.lastRead);
        } catch (e) {
          console.error('❌ [APP] Error load progress:', e);
        }
      }
    },

    continueReading() {
      if (this.lastRead && this.lastRead.surah) {
        this.activeTab = 'quran';
        setTimeout(() => {
          this.loadSurah(this.lastRead.surah);
        }, 100);
      }
    },

    async findNearbyMosques() {
      if (!this.userCoords) {
        alert('📍 Aktifkan lokasi terlebih dahulu untuk menemukan masjid terdekat');
        return;
      }

      this.loadingMosques = true;
      this.nearbyMosques = [];

      try {
        console.log('🕌 [API] Mencari masjid terdekat...');
        const { latitude, longitude } = this.userCoords;
        
        const radius = 2000;
        const query = `[out:json];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${latitude},${longitude}););out body;`;
        
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log('📦 [API] Masjid data:', data);

        const mosques = data.elements
          .filter(el => el.tags && el.tags.name)
          .map(el => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            const distance = this.calculateDistance(latitude, longitude, lat, lon);
            
            return {
              name: el.tags.name,
              address: el.tags['addr:full'] || el.tags['addr:street'] || 'Alamat tidak tersedia',
              lat: lat,
              lon: lon,
              distance: distance.toFixed(2)
            };
          })
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .slice(0, 10);

        this.nearbyMosques = mosques;
        console.log(`✅ [APP] ${mosques.length} masjid ditemukan`);

        if (mosques.length === 0) {
          alert('ℹ️ Tidak ada masjid ditemukan dalam radius 2km.\n\nCoba perbesar radius pencarian atau cek lokasi Anda.');
        }

      } catch (err) {
        console.error('❌ [APP] Error mencari masjid:', err);
        alert('❌ Gagal mencari masjid. Coba lagi nanti.');
      } finally {
        this.loadingMosques = false;
      }
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },

    openGoogleMaps(lat, lon, name) {
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(name)}`;
      window.open(url, '_blank');
    },

    setMood(mood) {
      this.currentMood = mood;
      console.log('💛 [APP] Mood set:', mood);
    },

    clearMood() {
      this.currentMood = null;
      console.log('💛 [APP] Mood cleared');
    },

    initDarkMode() {
      const saved = localStorage.getItem('darkMode');
      if (saved === 'true') {
        this.darkMode = true;
        document.documentElement.classList.add('dark');
        console.log('🌑 [APP] Dark mode aktif');
      } else {
        this.darkMode = false;
        document.documentElement.classList.remove('dark');
        console.log('☀️ [APP] Light mode aktif');
      }
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
        console.log('🌑 [APP] Dark mode diaktifkan');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
        console.log('☀️ [APP] Light mode diaktifkan');
      }
    },

    checkAutoDarkMode() {
      if (this.jadwal.Maghrib && this.jadwal.Fajr) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [maghribH, maghribM] = this.jadwal.Maghrib.split(':').map(Number);
        const [fajrH, fajrM] = this.jadwal.Fajr.split(':').map(Number);
        
        const maghribTime = maghribH * 60 + maghribM;
        const fajrTime = fajrH * 60 + fajrM;
        
        const isNight = currentTime >= maghribTime || currentTime < fajrTime;
        
        if (isNight && !this.darkMode) {
          console.log('🌙 [APP] Auto dark mode (malam hari)');
        }
      }
    }
  }));
  
  console.log('✅ [ALPINE] App component registered');
});

// ==============================
// PWA INSTALL PROMPT HANDLER
// ==============================
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('📲 [PWA] Install prompt tersedia');
});

window.addEventListener('appinstalled', () => {
  window.deferredPrompt = null;
  console.log('✅ [PWA] Aplikasi terinstall');
});

// ==============================
// DEBUG: Check SW and FCM status
// ==============================
window.checkFCMStatus = async function() {
  console.log('=== FCM Status Check ===');
  console.log('Notification permission:', Notification.permission);
  console.log('Service Worker support:', 'serviceWorker' in navigator);
  
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration('/platform/barakahku1/');
    console.log('SW Registration:', registration);
    console.log('SW Active:', registration?.active);
    console.log('SW Scope:', registration?.scope);
    console.log('SW State:', registration?.active?.state);
  }
  
  const token = localStorage.getItem('fcm_token');
  console.log('Saved FCM token:', token ? JSON.parse(token) : 'None');
  
  console.log('Firebase loaded:', typeof firebase !== 'undefined');
  if (typeof firebase !== 'undefined') {
    console.log('Firebase apps:', firebase.apps?.length || 0);
  }
  
  console.log('========================');
};

// ==============================
// DEBUG: Manual Firebase Init (for testing)
// ==============================
window.manualInitFCM = async function() {
  console.log('🔧 [DEBUG] Manual FCM initialization...');
  
  if (Notification.permission !== 'granted') {
    alert('⚠️ Izinkan notifikasi terlebih dahulu!');
    return;
  }
  
  await initFirebaseMessaging();
};

console.log('✅ [APP] app.js loaded successfully');
console.log('💡 [DEBUG] Commands:');
console.log('  - window.checkFCMStatus() : Cek status FCM');
console.log('  - window.manualInitFCM()  : Init FCM manual');