// ==============================
// BarakahKu - app.js (Fixed Version)
// ==============================

// ------------------------------
// Helper function to load external scripts
// ------------------------------
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// ------------------------------
// Fungsi inisialisasi Firebase Messaging (v8 Compat)
// ------------------------------
async function initFirebaseMessaging() {
  try {
    if (Notification.permission !== 'granted') {
      console.log('⚠️ Notifikasi belum diizinkan, skip Firebase Messaging init');
      return;
    }

    console.log('📦 Loading Firebase Compat SDK...');
    
    // Load Firebase App Compat
    if (!window.firebase) {
      await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
    }
    
    // Load Firebase Messaging Compat
    if (!window.firebase.messaging) {
      await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');
    }

    console.log('✅ Firebase Compat scripts loaded');

    // Initialize Firebase (cek apakah sudah diinit)
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
        authDomain: "barakahku-app.firebaseapp.com",
        projectId: "barakahku-app",
        storageBucket: "barakahku-app.firebasestorage.app",
        messagingSenderId: "510231053293",
        appId: "1:510231053293:web:921b9e574fc614492b5de4",
        measurementId: "G-EQPYKJJGG7"
      });
      console.log('✅ Firebase App initialized');
    }

    // Get messaging instance
    const messaging = firebase.messaging();

    // Get token dengan VAPID key
    try {
      const currentToken = await messaging.getToken({ 
        vapidKey: 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM'
      });
      
      if (currentToken) {
        console.log('🔑 FCM token diperoleh:', currentToken);
        console.log('💾 Simpan token ini untuk backend:', currentToken);
      } else {
        console.warn('⚠️ Tidak mendapatkan FCM token');
      }
    } catch (err) {
      console.error('❌ Gagal mengambil FCM token:', err);
    }

    // Handler untuk foreground messages
    messaging.onMessage((payload) => {
      console.log('📩 Pesan FCM diterima (foreground):', payload);
      try {
        const title = payload?.notification?.title || 'BarakahKu - Notifikasi';
        const body = payload?.notification?.body || '';
        
        if (Notification.permission === 'granted') {
          const notification = new Notification(title, {
            body,
            icon: '/platform/barakahku1/assets/icons/icon-192.png',
            badge: '/platform/barakahku1/assets/icons/icon-192.png',
            tag: 'barakahku-notification',
            requireInteraction: false,
            vibrate: [200, 100, 200],
            data: {
              url: payload.notification?.click_action || 'https://www.emydngroup.com/platform/barakahku1/'
            }
          });

          notification.onclick = function(event) {
            event.preventDefault();
            window.focus();
            notification.close();
          };
        }
      } catch (err) {
        console.error('❌ Error menampilkan notifikasi foreground:', err);
      }
    });

  } catch (error) {
    console.error('❌ Firebase Messaging initialization failed:', error);
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

      // Auto-stop murottal feature
      document.addEventListener('play', function (e) {
        const audios = document.getElementsByTagName('audio');
        for (let i = 0; i < audios.length; i++) {
          if (audios[i] !== e.target) {
            audios[i].pause();
          }
        }
      }, true);

      console.log('✅ Aplikasi siap digunakan');
    },

    async loadQuran() {
      try {
        console.log('📖 Memuat daftar surah...');
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        this.quran = data.data.map(s => ({
          nomor: s.nomor,
          namaLatin: s.namaLatin,
          arti: s.arti,
          jumlahAyat: s.jumlahAyat
        }));
        console.log(`✅ ${this.quran.length} surah berhasil dimuat`);
      } catch (err) {
        console.error('❌ Gagal memuat Quran:', err);
      }
    },

    async loadSurah(nomor) {
      try {
        console.log(`📖 Membuka surah nomor ${nomor}...`);
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
        console.log(`✅ Surah ${data.data.namaLatin} berhasil dimuat`);
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      } catch (err) {
        console.error('❌ Gagal memuat surah:', err);
      }
    },

    loadDoa() {
      console.log('🙏 Memuat doa-doa harian...');
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
          arab: 'اَلْحَمْدُ لِلَّهِ الَّذِيْ كَسَانِيْ هَذَا وَرَزَقَنِيْهِ...',
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
      console.log(`✅ ${this.doaList.length} doa berhasil dimuat`);
    },

    async loadMurotalList() {
      try {
        console.log('🎵 Memuat daftar murottal...');
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

        console.log(`✅ ${this.murotalList.length} murottal berhasil dimuat`);
      } catch (err) {
        console.error('❌ Gagal memuat murottal:', err);
        this.murotalList = [];
      }
    },

    playMurotal(audioUrl) {
      try {
        const player = document.getElementById('murotalPlayer');
        if (!player) {
          console.warn('⚠️ Audio element tidak ditemukan di halaman.');
          return;
        }

        player.src = audioUrl;
        player.load();
        player.play()
          .then(() => console.log('🎶 Murottal diputar:', audioUrl))
          .catch(err => console.warn('⚠️ Autoplay diblokir, butuh interaksi user:', err));
      } catch (err) {
        console.error('❌ Gagal memutar murottal:', err);
      }
    },

    async loadJadwal() {
      if (!navigator.geolocation) {
        this.cityName = 'Lokasi tidak tersedia';
        console.warn('⚠️ Geolocation tidak didukung browser');
        return;
      }

      console.log('📍 Mendapatkan lokasi...');
      this.cityName = 'Mendapatkan lokasi...';

      navigator.geolocation.getCurrentPosition(async pos => {
        const { latitude, longitude } = pos.coords;
        console.log(`📍 Lokasi: ${latitude}, ${longitude}`);

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

          console.log('✅ Jadwal sholat berhasil dimuat');
        } catch (err) {
          console.error('❌ Gagal memuat jadwal sholat:', err);
          this.cityName = 'Gagal memuat lokasi';
        }
      }, err => {
        console.error('❌ Gagal mendapatkan lokasi:', err);
        this.cityName = 'Lokasi ditolak';
      });
    },

    loadChecklist() {
      console.log('✅ Memuat checklist ibadah...');
      const saved = localStorage.getItem('checklist');
      if (saved) {
        try {
          this.checklist = JSON.parse(saved);
        } catch (e) {
          console.error('❌ Error parsing checklist:', e);
        }
      }

      const lastDate = localStorage.getItem('checklistDate');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        console.log('🔄 Hari baru, reset checklist');
        this.checklist.forEach(item => item.done = false);
        localStorage.setItem('checklistDate', today);
        this.saveChecklist();
      }

      const doneCount = this.checklist.filter(i => i.done).length;
      console.log(`✅ Checklist dimuat: ${doneCount}/${this.checklist.length} selesai`);
    },

    saveChecklist() {
      try {
        localStorage.setItem('checklist', JSON.stringify(this.checklist));
        const doneCount = this.checklist.filter(i => i.done).length;
        console.log(`💾 Checklist disimpan: ${doneCount}/${this.checklist.length} selesai`);
      } catch (e) {
        console.error('❌ Error saving checklist:', e);
      }
    },

    bookmarkAyat(nomorAyat) {
      try {
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const key = `${this.currentSurah.namaLatin}-${nomorAyat}`;

        if (!bookmarks.includes(key)) {
          bookmarks.push(key);
          localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
          alert(`✅ Ayat ${nomorAyat} dari Surah ${this.currentSurah.namaLatin} berhasil disimpan! 🔖`);
          console.log('🔖 Bookmark disimpan:', key);
        } else {
          alert('ℹ️ Ayat sudah tersimpan sebelumnya');
        }
      } catch (e) {
        console.error('❌ Error bookmarking ayat:', e);
        alert('❌ Gagal menyimpan ayat');
      }
    },

    installApp() {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ User menerima install prompt');
          } else {
            console.log('❌ User menolak install prompt');
          }
          window.deferredPrompt = null;
        });
      } else {
        alert('ℹ️ Aplikasi sudah terinstall atau browser tidak mendukung instalasi PWA.\n\nUntuk menginstall:\n• Chrome Android: Buka menu → Install app\n• Safari iOS: Tap Share → Add to Home Screen');
      }
    },

    async requestNotificationPermission() {
      if (Notification.permission === 'granted') {
        alert('✅ Izin notifikasi sudah diberikan!');
        console.log('🔔 Permission sudah granted');
        return;
      }
      
      if (Notification.permission === 'denied') {
        alert('❌ Izin notifikasi ditolak. Silakan aktifkan dari pengaturan browser:\n\n1. Klik ikon gembok di address bar\n2. Cari "Notifications"\n3. Ubah ke "Allow"');
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await initFirebaseMessaging();
          alert('✅ Notifikasi berhasil diaktifkan!\n\nAnda akan menerima pengingat sholat dan notifikasi ibadah.');
          console.log('🔔 Permission granted, Firebase Messaging initialized');
        } else {
          alert('❌ Izin notifikasi ditolak');
        }
      } catch (err) {
        console.error('❌ Error meminta izin notifikasi:', err);
        alert('❌ Gagal meminta izin notifikasi: ' + err.message);
      }
    },

    registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        // HANYA REGISTER SATU SERVICE WORKER
        navigator.serviceWorker.register('/platform/barakahku1/service-worker.js', {
          scope: '/platform/barakahku1/'
        })
          .then(registration => {
            console.log('✅ Service Worker terdaftar:', registration.scope);
            
            // Tunggu service worker aktif
            if (registration.active && Notification.permission === 'granted') {
              console.log('🔔 Service Worker aktif, inisialisasi Firebase Messaging...');
              setTimeout(() => {
                initFirebaseMessaging();
              }, 2000);
            }

            // Listen untuk service worker yang baru aktif
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated' && Notification.permission === 'granted') {
                  console.log('🔔 Service Worker baru aktif, inisialisasi Firebase Messaging...');
                  setTimeout(() => {
                    initFirebaseMessaging();
                  }, 2000);
                }
              });
            });
          })
          .catch(err => {
            console.error('❌ Gagal register Service Worker:', err);
          });
      } else {
        console.warn('⚠️ Service Worker tidak didukung browser');
      }
    }
  };
}

// ✅ EKSPOS ke Alpine.js
document.addEventListener('alpine:init', () => {
  Alpine.data('app', createApp);
});

// PWA install prompt handlers
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('📲 Install prompt tersedia');
});

window.addEventListener('appinstalled', () => {
  console.log('✅ BarakahKu berhasil diinstall!');
  window.deferredPrompt = null;
});