// ==============================
// BarakahKu - app.js (FIXED FCM!)
// ==============================

console.log('📦 [APP] Loading app.js...');

// ------------------------------
// Fungsi inisialisasi Firebase Messaging (v8) - FIXED!
// ------------------------------
async function initFirebaseMessaging() {
  try {
    console.log('🔔 [FCM] Mulai inisialisasi...');
    
    if (Notification.permission !== 'granted') {
      console.log('⚠️ [FCM] Notifikasi belum diizinkan');
      return;
    }

    // ✅ Load Firebase SDK
    if (!window.firebase || !window.firebase.messaging) {
      console.log('📦 [FCM] Loading Firebase v8 SDK...');
      
      await new Promise((resolve, reject) => {
        const script1 = document.createElement('script');
        script1.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        script1.onload = () => {
          console.log('✅ [FCM] Firebase App v8 loaded');
          const script2 = document.createElement('script');
          script2.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js';
          script2.onload = () => {
            console.log('✅ [FCM] Firebase Messaging v8 loaded');
            resolve();
          };
          script2.onerror = reject;
          document.head.appendChild(script2);
        };
        script1.onerror = reject;
        document.head.appendChild(script1);
      });
    } else {
      console.log('✅ [FCM] Firebase v8 sudah loaded');
    }

    // ✅ Initialize Firebase
    if (!firebase.apps || firebase.apps.length === 0) {
      firebase.initializeApp({
        apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
        authDomain: "barakahku-app.firebaseapp.com",
        projectId: "barakahku-app",
        storageBucket: "barakahku-app.firebasestorage.app",
        messagingSenderId: "510231053293",
        appId: "1:510231053293:web:921b9e574fc614492b5de4"
      });
      console.log('✅ [FCM] Firebase initialized');
    } else {
      console.log('✅ [FCM] Firebase sudah initialized');
    }

    // ✅ CRITICAL FIX: Tunggu SW dengan cara yang benar
    console.log('⏳ [FCM] Waiting for Service Worker...');
    
    let swRegistration;
    
    // Cek apakah SW sudah ready
    if (navigator.serviceWorker.controller) {
      console.log('✅ [FCM] SW controller sudah ada');
      swRegistration = await navigator.serviceWorker.ready;
    } else {
      // Tunggu SW dengan timeout yang lebih panjang
      console.log('⏳ [FCM] Waiting for SW ready...');
      swRegistration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SW timeout after 10s')), 10000)
        )
      ]);
    }
    
    console.log('✅ [FCM] Service Worker ready!');
    console.log('📍 [FCM] SW scope:', swRegistration.scope);

    // ✅ Request token dengan SW registration
    console.log('🔑 [FCM] Requesting token...');
    
    const messaging = firebase.messaging();
    
    // Use SW registration explicitly
    messaging.useServiceWorker(swRegistration);
    
    const currentToken = await messaging.getToken({ 
      vapidKey: 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM',
      serviceWorkerRegistration: swRegistration
    });
    
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
      
      // Show alert
      alert('🎉 FCM Token berhasil!\n\nToken: ' + currentToken.substring(0, 50) + '...');
      
    } else {
      console.warn('⚠️ [FCM] Tidak dapat token');
      alert('⚠️ Token tidak ditemukan. Coba refresh page.');
    }

    // ✅ Handler foreground messages
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
          vibrate: [200, 100, 200]
        });
      }
    });

    console.log('✅ [FCM] Setup complete!');

  } catch (error) {
    console.error('❌ [FCM] Init failed:', error);
    console.error('❌ [FCM] Error name:', error.name);
    console.error('❌ [FCM] Error message:', error.message);
    console.error('❌ [FCM] Error stack:', error.stack);
    
    // User-friendly error message
    let errorMsg = 'Gagal menginisialisasi notifikasi.';
    if (error.message.includes('timeout')) {
      errorMsg += '\n\nService Worker belum siap. Coba:\n1. Refresh halaman\n2. Tunggu beberapa detik\n3. Coba lagi';
    }
    alert('❌ FCM Error: ' + errorMsg);
  }
}

// ==============================
// ALPINE.JS DATA REGISTRATION
// ==============================
document.addEventListener('alpine:init', () => {
  console.log('🎨 [ALPINE] Registering app component...');
  
  Alpine.data('app', () => ({
    // Data Properties
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
      cemas: { ayat: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', arti: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram', ref: 'QS. Ar\'d: 28' },
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

    // Init Method
    init() {
      // ✅ GUARD: Prevent double initialization
      if (this._initialized) {
        console.log('⚠️ [APP] Already initialized, skipping...');
        return;
      }
      this._initialized = true;
      
      console.log('🚀 [APP] BarakahKu - Memulai aplikasi...');
      console.log('📊 [APP] Alpine.js version:', Alpine.version);
      
      // ✅ Register SW first
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

    // Methods
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
          alert('✅ Notifikasi sudah aktif!\n\nToken tersimpan dan siap digunakan.');
          console.log('Token:', JSON.parse(saved));
        } else {
          alert('⏳ Menginisialisasi notifikasi...');
          await initFirebaseMessaging();
        }
        return;
      }
      
      if (Notification.permission === 'denied') {
        alert('❌ Izin ditolak.\n\nAktifkan dari:\n1. Klik gembok di address bar\n2. Izinkan Notifications\n3. Refresh halaman');
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          alert('✅ Izin diberikan!\n\nSedang setup sistem notifikasi...');
          
          // Tunggu sebentar untuk memastikan SW ready
          setTimeout(async () => {
            await initFirebaseMessaging();
            
            const saved = localStorage.getItem('fcm_token');
            if (saved) {
              alert('🎉 Notifikasi aktif!\n\nAnda akan menerima:\n• Pengingat sholat\n• Notifikasi ibadah\n• Pesan motivasi');
            }
          }, 2000);
        }
      } catch (err) {
        console.error('❌ [FCM] Error permission:', err);
        alert('❌ Gagal: ' + err.message);
      }
    },

    async registerServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ [SW] Service Worker tidak didukung');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register(
          '/platform/barakahku1/service-worker.js',
          { scope: '/platform/barakahku1/' }
        );
        
        console.log('✅ [SW] Service Worker registered');
        console.log('📍 [SW] Scope:', registration.scope);
        
        // ✅ CRITICAL: Tunggu SW benar-benar ready
        await navigator.serviceWorker.ready;
        console.log('✅ [SW] Service Worker ready');
        
        // ✅ CRITICAL: Jangan langsung init FCM, tunggu user klik tombol
        // Hapus auto-init FCM dari sini
        console.log('💡 [SW] SW ready, FCM akan diinit saat user request');
        
      } catch (err) {
        console.error('❌ [SW] Failed:', err);
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
        
        const radius = 2000; // 2km
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
      const R = 6371; // Radius bumi dalam km
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

console.log('✅ [APP] app.js loaded successfully');