// ==============================
// BarakahKu - app.js (Firebase v8 + Custom SW Path)
// ==============================

// ------------------------------
// Fungsi inisialisasi Firebase Messaging (v8 Legacy)
// ------------------------------
async function initFirebaseMessaging() {
  try {
    console.log('🔔 [FCM] Mulai inisialisasi...');
    
    // Cek permission
    if (Notification.permission !== 'granted') {
      console.log('⚠️ [FCM] Notifikasi belum diizinkan');
      return;
    }

    // Load Firebase v8 SDK
    if (!window.firebase) {
      console.log('📦 [FCM] Loading Firebase v8 SDK...');
      
      await new Promise((resolve, reject) => {
        const script1 = document.createElement('script');
        script1.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js';
          script2.onload = resolve;
          script2.onerror = reject;
          document.head.appendChild(script2);
        };
        script1.onerror = reject;
        document.head.appendChild(script1);
      });
      
      console.log('✅ [FCM] Firebase v8 loaded');
    }

    // Initialize Firebase
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
    }

    // Get messaging instance
    const messaging = firebase.messaging();
    
    // PENTING: Gunakan custom service worker path
    console.log('🔧 [FCM] Using custom SW path...');
    
    // Register Firebase Messaging Service Worker di folder barakahku1
    const swRegistration = await navigator.serviceWorker.register(
      '/platform/barakahku1/firebase-messaging-sw.js',
      { scope: '/platform/barakahku1/' }
    );
    
    console.log('✅ [FCM] Firebase SW registered:', swRegistration.scope);
    
    // Tunggu SW active
    await navigator.serviceWorker.ready;
    console.log('✅ [FCM] Firebase SW ready');
    
    // Get token dengan SW yang sudah terdaftar
    try {
      const currentToken = await messaging.getToken({ 
        vapidKey: 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM',
        serviceWorkerRegistration: swRegistration
      });
      
      if (currentToken) {
        console.log('🔑 [FCM] Token berhasil!');
        console.log('📋 Token:', currentToken);
        
        // Simpan token
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
    } catch (err) {
      console.error('❌ [FCM] Error get token:', err);
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
    murotalList: [],
    jadwal: {},
    cityName: 'Memuat lokasi...',
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
      await this.loadQuran();
      this.loadDoa();
      this.loadJadwal();
      this.loadChecklist();
      await this.loadMurotalList();
      this.registerServiceWorker();

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
          namaLatin: data.data.namaLatin,
          ayat: data.data.ayat.map(a => ({
            nomorAyat: a.nomorAyat,
            arab: a.teksArab,
            latin: a.teksLatin,
            teks: a.teksIndonesia
          }))
        };
        localStorage.setItem('lastRead', nomor);
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
        return;
      }

      console.log('📍 Get lokasi...');
      this.cityName = 'Mendapatkan lokasi...';

      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const geoData = await geoRes.json();

          this.cityName = geoData.address.city ||
                          geoData.address.town ||
                          geoData.address.county ||
                          geoData.address.state ||
                          'Lokasi Anda';

          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
          const data = await res.json();
          this.jadwal = data.data.timings;

          console.log('✅ Jadwal sholat dimuat');
        } catch (err) {
          console.error('❌ Error jadwal:', err);
          this.cityName = 'Gagal memuat';
        }
      }, err => {
        console.error('❌ Error lokasi:', err);
        this.cityName = 'Lokasi ditolak';
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

    registerServiceWorker() {
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ SW tidak didukung');
        return;
      }

      // Register PWA Service Worker untuk caching
      navigator.serviceWorker.register('/platform/barakahku1/service-worker.js', {
        scope: '/platform/barakahku1/'
      })
        .then(registration => {
          console.log('✅ [SW] PWA Service Worker registered');
          
          // Auto init Firebase jika sudah granted
          if (Notification.permission === 'granted') {
            console.log('🔔 Permission granted, init FCM in 3s...');
            setTimeout(() => {
              initFirebaseMessaging();
            }, 3000);
          }
        })
        .catch(err => {
          console.error('❌ [SW] Failed:', err);
        });
    }
  };
}

// Export to Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.data('app', createApp);
});

// PWA install handlers
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('📲 Install prompt ready');
});

window.addEventListener('appinstalled', () => {
  console.log('✅ App installed!');
  window.deferredPrompt = null;
});