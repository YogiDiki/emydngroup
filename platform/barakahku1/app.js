// ==============================
// BarakahKu - app.js (Firebase v8 UNIFIED SW!)
// ==============================

// ------------------------------
// Fungsi inisialisasi Firebase Messaging (v8)
// ------------------------------
async function initFirebaseMessaging() {
  try {
    console.log('🔔 [FCM] Mulai inisialisasi...');
    
    // Cek permission
    if (Notification.permission !== 'granted') {
      console.log('⚠️ [FCM] Notifikasi belum diizinkan');
      return;
    }

    // Load Firebase v8 SDK - HANYA SEKALI
    if (!window.firebase || !window.firebase.messaging) {
      console.log('📦 [FCM] Loading Firebase v8 SDK...');
      
      // Hapus script lama jika ada
      const oldScripts = document.querySelectorAll('script[src*="firebasejs"]');
      oldScripts.forEach(s => s.remove());
      
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

    // Initialize Firebase - HANYA SEKALI
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

    // CRITICAL: Tunggu SW ready dan gunakan SW yang sudah ada
    const swRegistration = await navigator.serviceWorker.ready;
    console.log('✅ [FCM] Service Worker ready:', swRegistration.scope);

    // Get messaging instance
    const messaging = firebase.messaging();
    
    // CRITICAL FIX: useServiceWorker() HARUS dipanggil SEBELUM getToken()!
    // Ini untuk Firebase v8 agar tidak cari firebase-messaging-sw.js di root
    messaging.useServiceWorker(swRegistration);
    console.log('✅ [FCM] Messaging menggunakan existing SW');
    
    console.log('🔑 [FCM] Requesting token...');
    
    const currentToken = await messaging.getToken({ 
      vapidKey: 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM'
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
      
    } else {
      console.warn('⚠️ [FCM] Tidak dapat token');
    }

    // Handler foreground messages
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
    console.error('Detail:', error.message);
    console.error('Stack:', error.stack);
  }
}

// ==============================
// APLIKASI UTAMA BARAKAHKU
// ==============================
function createApp() {
  return {
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

    async init() {
      console.log('🚀 BarakahKu - Memulai aplikasi...');
      await this.registerServiceWorker();
      this.loadJadwal();
      await this.loadQuran();
      this.loadDoa();
      this.loadChecklist();
      await this.loadMurotalList();
      this.loadLastRead();
      this.initDarkMode();

      // Auto-stop murottal
      document.addEventListener('play', function (e) {
        const audios = document.getElementsByTagName('audio');
        for (let i = 0; i < audios.length; i++) {
          if (audios[i] !== e.target) {
            audios[i].pause();
          }
        }
      }, true);

      console.log('✅ Aplikasi siap');
    },

    async loadQuran() {
      try {
        console.log('📖 Memuat surah...');
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        this.quran = data.data.map(s => ({
          nomor: s.nomor,
          namaLatin: s.namaLatin,
          arti: s.arti,
          jumlahAyat: s.jumlahAyat
        }));
        console.log(`✅ ${this.quran.length} surah dimuat`);
      } catch (err) {
        console.error('❌ Error load Quran:', err);
      }
    },

    async loadSurah(nomor) {
      try {
        console.log(`📖 Buka surah ${nomor}...`);
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        const data = await res.json();
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
        
        // Simpan progress bacaan
        this.lastRead = {
          surah: nomor,
          namaLatin: data.data.namaLatin,
          ayat: 1,
          timestamp: new Date().toLocaleString('id-ID')
        };
        localStorage.setItem('lastRead', JSON.stringify(this.lastRead));
        
        console.log(`✅ Surah ${data.data.namaLatin} dimuat`);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } catch (err) {
        console.error('❌ Error load surah:', err);
      }
    },

    loadDoa() {
      console.log('🙏 Memuat doa...');
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
      console.log(`✅ ${this.doaList.length} doa dimuat`);
    },

    async loadMurotalList() {
      try {
        console.log('🎵 Memuat murottal...');
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();

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

        console.log(`✅ ${this.murotalList.length} murottal dimuat`);
      } catch (err) {
        console.error('❌ Error murottal:', err);
        this.murotalList = [];
      }
    },

    async loadJadwal() {
      if (!navigator.geolocation) {
        this.cityName = 'Lokasi tidak tersedia';
        this.hijriDate = 'Tanggal tidak tersedia';
        return;
      }

      console.log('📍 Get lokasi...');
      this.cityName = 'Mendapatkan lokasi...';
      this.hijriDate = 'Memuat tanggal...';

      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        this.userCoords = { latitude, longitude };
        console.log(`📍 Koordinat: ${latitude}, ${longitude}`);

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const geoData = await geoRes.json();

          this.cityName = geoData.address.city ||
                          geoData.address.town ||
                          geoData.address.county ||
                          geoData.address.state ||
                          'Lokasi Anda';

          console.log(`📍 Kota: ${this.cityName}`);

          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
          const data = await res.json();
          this.jadwal = data.data.timings;
          
          if (data.data.date && data.data.date.hijri) {
            const hijri = data.data.date.hijri;
            this.hijriDate = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
            console.log(`📅 Hijriah: ${this.hijriDate}`);
          }

          this.checkAutoDarkMode();

          console.log('✅ Jadwal sholat dimuat');
        } catch (err) {
          console.error('❌ Error jadwal:', err);
          this.cityName = 'Gagal memuat lokasi';
          this.hijriDate = 'Gagal memuat tanggal';
        }
      }, err => {
        console.error('❌ Error lokasi:', err);
        this.cityName = 'Lokasi ditolak';
        this.hijriDate = 'Tanggal tidak tersedia';
      });
    },

    loadChecklist() {
      const saved = localStorage.getItem('checklist');
      if (saved) {
        try {
          this.checklist = JSON.parse(saved);
        } catch (e) {
          console.error('❌ Error checklist:', e);
        }
      }

      const lastDate = localStorage.getItem('checklistDate');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        this.checklist.forEach(item => item.done = false);
        localStorage.setItem('checklistDate', today);
        this.saveChecklist();
      }
    },

    saveChecklist() {
      try {
        localStorage.setItem('checklist', JSON.stringify(this.checklist));
      } catch (e) {
        console.error('❌ Error save:', e);
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
        console.error('❌ Error bookmark:', e);
      }
    },

    installApp() {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ Install accepted');
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
          
          setTimeout(async () => {
            await initFirebaseMessaging();
            
            const saved = localStorage.getItem('fcm_token');
            if (saved) {
              alert('🎉 Notifikasi aktif!\n\nAnda akan menerima:\n• Pengingat sholat\n• Notifikasi ibadah\n• Pesan motivasi');
            }
          }, 2000);
        }
      } catch (err) {
        console.error('❌ Error permission:', err);
        alert('❌ Gagal: ' + err.message);
      }
    },

    async registerServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ SW tidak didukung');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register(
          '/platform/barakahku1/service-worker.js',
          { scope: '/platform/barakahku1/' }
        );
        
        console.log('✅ [SW] Service Worker registered');
        console.log('📍 [SW] Scope:', registration.scope);
        
        await navigator.serviceWorker.ready;
        console.log('✅ [SW] Service Worker ready');
        
        if (Notification.permission === 'granted') {
          console.log('🔔 Permission granted, init FCM in 3s...');
          setTimeout(() => {
            initFirebaseMessaging();
          }, 3000);
        }
      } catch (err) {
        console.error('❌ [SW] Failed:', err);
      }
    },

    // 📖 Progress Bacaan Qur'an
    loadLastRead() {
      const saved = localStorage.getItem('lastRead');
      if (saved) {
        try {
          this.lastRead = JSON.parse(saved);
          console.log('📖 Progress bacaan dimuat:', this.lastRead);
        } catch (e) {
          console.error('❌ Error load progress:', e);
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

    // 🕌 Masjid Terdekat
    async findNearbyMosques() {
      if (!this.userCoords) {
        alert('📍 Aktifkan lokasi terlebih dahulu untuk menemukan masjid terdekat');
        return;
      }

      this.loadingMosques = true;
      this.nearbyMosques = [];

      try {
        const { latitude, longitude } = this.userCoords;
        
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${latitude},${longitude});
            way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${latitude},${longitude});
          );
          out body;
          >;
          out skel qt;
        `;
        
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.elements && data.elements.length > 0) {
          this.nearbyMosques = data.elements
            .filter(el => el.tags && el.tags.name)
            .map(el => ({
              name: el.tags.name || 'Masjid',
              address: el.tags['addr:full'] || el.tags['addr:street'] || 'Alamat tidak tersedia',
              lat: el.lat,
              lon: el.lon,
              distance: this.calculateDistance(latitude, longitude, el.lat, el.lon)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);

          console.log(`🕌 ${this.nearbyMosques.length} masjid ditemukan`);
        } else {
          alert('🕌 Tidak ada masjid ditemukan dalam radius 5km');
        }
      } catch (err) {
        console.error('❌ Error find mosques:', err);
        alert('❌ Gagal mencari masjid: ' + err.message);
      } finally {
        this.loadingMosques = false;
      }
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(2);
    },

    openGoogleMaps(lat, lon, name) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${encodeURIComponent(name)}`;
      window.open(url, '_blank');
    },

    // 💛 Mood Islami
    setMood(mood) {
      this.currentMood = mood;
      console.log('💛 Mood dipilih:', mood);
    },

    clearMood() {
      this.currentMood = null;
    },

    // 🌑 Dark Mode Otomatis
    initDarkMode() {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        this.darkMode = saved === 'true';
      } else {
        this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      this.applyDarkMode();
      console.log('🌑 Dark mode:', this.darkMode);
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      this.applyDarkMode();
    },

    applyDarkMode() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    checkAutoDarkMode() {
      if (this.jadwal.Maghrib && this.jadwal.Fajr) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const maghribTime = this.jadwal.Maghrib;
        const fajrTime = this.jadwal.Fajr;

        if (currentTime >= maghribTime || currentTime < fajrTime) {
          if (!this.darkMode) {
            this.darkMode = true;
            this.applyDarkMode();
            console.log('🌑 Auto dark mode aktif (setelah Maghrib)');
          }
        } else {
          if (this.darkMode && !localStorage.getItem('darkMode')) {
            this.darkMode = false;
            this.applyDarkMode();
            console.log('☀️ Auto light mode aktif (setelah Subuh)');
          }
        }
      }
    }
  };
}

// ==============================
// EXPORT TO ALPINE.JS
// ==============================

// Export to Alpine.js
document.addEventListener('alpine:init', () => {
  console.log('✅ Alpine:init event fired, registering app...');
  Alpine.data('app', createApp);
});

// ==============================
// PWA INSTALL HANDLERS
// ==============================

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('📲 Install prompt ready');
});

window.addEventListener('appinstalled', () => {
  console.log('✅ App installed!');
  window.deferredPrompt = null;
});