// ==============================
// BarakahKu - app.js (COMPACT!)
// ==============================

console.log('📦 [APP] Loading...');

let fcmInit = false;

async function initFCM() {
  if (fcmInit) return console.log('⚠️ Already initialized');
  fcmInit = true;
  
  try {
    if (Notification.permission !== 'granted') {
      fcmInit = false;
      return alert('⚠️ Izin notifikasi diperlukan');
    }

    console.log('🔔 Starting FCM...');
    
    // Get SW registration
    let sw = await navigator.serviceWorker.getRegistration('/platform/barakahku1/');
    if (!sw) sw = await navigator.serviceWorker.ready;
    console.log('✅ SW ready');
    
    await new Promise(r => setTimeout(r, 2000));

    // Load Firebase SDK
    if (!window.firebase) {
      console.log('📦 Loading Firebase...');
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
      console.log('✅ Firebase loaded');
    }

    // Init Firebase
    if (!firebase.apps?.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyDbtIz_-mXJIjkFYOYBfPGq_KSMUTzQgwQ",
        authDomain: "barakahku-app.firebaseapp.com",
        projectId: "barakahku-app",
        storageBucket: "barakahku-app.appspot.com",
        messagingSenderId: "510231053293",
        appId: "1:510231053293:web:921b9e574fc614492b5de4"
      });
    }

    const msg = firebase.messaging();
    console.log('🔑 Getting token...');
    
    const token = await msg.getToken({ 
      vapidKey: 'BEFVvRCw1LLJSS1Ss7VSeCFAmLx57Is7MgJHqsn-dtS3jUcI1S-PZjK9ybBK3XAFdnSLgm0iH9RvvRiDOAnhmsM',
      serviceWorkerRegistration: sw
    });
    
    if (token) {
      localStorage.setItem('fcm_token', JSON.stringify({
        token,
        timestamp: new Date().toLocaleString('id-ID')
      }));
      console.log('✅ Token:', token);
      alert('🎉 FCM berhasil!\n\nToken: ' + token.substring(0, 50) + '...');
    }

    msg.onMessage(p => {
      console.log('📩 Message:', p);
      if (Notification.permission === 'granted') {
        new Notification(p.notification?.title || 'BarakahKu', {
          body: p.notification?.body,
          icon: '/platform/barakahku1/assets/icons/icon-192.png'
        });
      }
    });

    console.log('✅ FCM complete');

  } catch (err) {
    fcmInit = false;
    console.error('❌ FCM error:', err);
    alert('❌ Error: ' + err.message);
  }
}

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    activeTab: 'beranda',
    quran: [],
    currentSurah: null,
    doaList: [],
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
    moodSuggestions: {
      sedih: { ayat: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', arti: 'Sesungguhnya bersama kesulitan ada kemudahan', ref: 'QS. Al-Insyirah: 6' },
      senang: { ayat: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ', arti: 'Dan terhadap nikmat Tuhanmu hendaklah kamu nyatakan', ref: 'QS. Ad-Duha: 11' },
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
      this.registerServiceWorker();
      this.loadQuran();
      this.loadDoa();
      this.loadChecklist();
      this.loadMurotalList();
      this.loadJadwal();
      this.loadLastRead();
      this.initDarkMode();
      
      document.addEventListener('play', e => {
        document.querySelectorAll('audio').forEach(a => { if (a !== e.target) a.pause(); });
      }, true);
    },

    async loadQuran() {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        this.quran = data.data.map(s => ({
          nomor: s.nomor,
          namaLatin: s.namaLatin,
          arti: s.arti,
          jumlahAyat: s.jumlahAyat
        }));
      } catch (err) {
        console.error('Error load Quran:', err);
        this.quran = [{ nomor: 1, namaLatin: 'Al-Fatihah', arti: 'Pembukaan', jumlahAyat: 7 }];
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
        console.error('Error load surah:', err);
      }
    },

    loadDoa() {
      this.doaList = [
        { id: 1, judul: 'Doa Sebelum Makan', arab: 'بِسْمِ اللهِ وَعَلَى بَرَكَةِ اللهِ', latin: 'Bismillahi wa \'ala barakatillah', terjemah: 'Dengan menyebut nama Allah dan atas berkah Allah' },
        { id: 2, judul: 'Doa Sesudah Makan', arab: 'اَلْحَمْدُ ِللهِ الَّذِىْ اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ', latin: 'Alhamdulillahilladzi ath\'amana wasaqona waja\'alana muslimin', terjemah: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim' },
        { id: 3, judul: 'Doa Bangun Tidur', arab: 'اَلْحَمْدُ ِللهِ الَّذِيْ اَحْيَانَا بَعْدَمَآ اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ', latin: 'Alhamdu lillahil ladzi ahyana ba\'da ma amatana wa ilaihin nusyur', terjemah: 'Segala puji bagi Allah yang telah menghidupkan kami sesudah kami mati dan hanya kepada-Nya kami kembali' },
        { id: 4, judul: 'Doa Sebelum Tidur', arab: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', latin: 'Bismika Allahumma amuutu wa ahyaa', terjemah: 'Dengan nama-Mu ya Allah aku mati dan aku hidup' },
        { id: 5, judul: 'Doa Masuk Kamar Mandi', arab: 'اَللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِِ وَالْخَبَائِثِ', latin: 'Allahumma inni a\'udzu bika minal khubutsi wal khaba\'its', terjemah: 'Ya Allah, aku berlindung kepada-Mu dari godaan setan laki-laki dan perempuan' },
        { id: 6, judul: 'Doa Keluar Kamar Mandi', arab: 'غُفْرَانَكَ', latin: 'Ghufraanaka', terjemah: 'Aku mohon ampunan-Mu' },
        { id: 7, judul: 'Doa Masuk Masjid', arab: 'اَللَّهُمَّ افْتَحْ لِيْ أَبْوَابَ رَحْمَتِكَ', latin: 'Allahummaftah lii abwaaba rahmatika', terjemah: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu' },
        { id: 8, judul: 'Doa Keluar Masjid', arab: 'اَللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', latin: 'Allahumma inni as\'aluka min fadhlika', terjemah: 'Ya Allah, sesungguhnya aku mohon kepada-Mu dari karunia-Mu' },
        { id: 9, judul: 'Doa Memakai Pakaian', arab: 'اَلْحَمْدُ لِلَّهِ الَّذِيْ كَسَانِيْ هَذَا وَرَزَقَنِيْهِ مِنْ غَيْرِ حَوْلٍ مِنِّيْ وَلاَ قُوَّةٍ', latin: 'Alhamdu lillahil ladzi kasani hadza wa razaqanihi min ghairi haulin minni wa laa quwwata', terjemah: 'Segala puji bagi Allah yang memberi aku pakaian ini dan memberi rizki kepadaku tanpa daya dan kekuatan dariku' },
        { id: 10, judul: 'Doa Ketika Turun Hujan', arab: 'اَللَّهُمَّ صَيِّبًا نَافِعًا', latin: 'Allahumma shayyiban naafi\'aa', terjemah: 'Ya Allah, turunkanlah hujan yang bermanfaat' }
      ];
    },

    async loadMurotalList() {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        this.murotalList = data.data.map(s => ({
          id: s.nomor,
          judul: s.namaLatin + ' - ' + s.nama,
          qari: 'Mishari Rashid Al-Afasy',
          audio: s.audioFull?.['05'] || s.audioFull?.['01'] || ''
        }));
      } catch (err) {
        console.error('Error murottal:', err);
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
          this.cityName = geoData.address.city || geoData.address.town || geoData.address.state || 'Lokasi Anda';

          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
          const data = await res.json();
          this.jadwal = data.data.timings;
          
          if (data.data.date?.hijri) {
            const h = data.data.date.hijri;
            this.hijriDate = `${h.day} ${h.month.en} ${h.year} AH`;
          }
        } catch (err) {
          console.error('Error jadwal:', err);
        }
      }, err => console.error('Error lokasi:', err));
    },

    loadChecklist() {
      const saved = localStorage.getItem('checklist');
      if (saved) {
        try { this.checklist = JSON.parse(saved); } catch (e) {}
      }
      const lastDate = localStorage.getItem('checklistDate');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        this.checklist.forEach(i => i.done = false);
        localStorage.setItem('checklistDate', today);
        this.saveChecklist();
      }
    },

    saveChecklist() {
      try {
        localStorage.setItem('checklist', JSON.stringify(this.checklist));
      } catch (e) {}
    },

    bookmarkAyat(n) {
      try {
        let bm = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const key = `${this.currentSurah.namaLatin}-${n}`;
        if (!bm.includes(key)) {
          bm.push(key);
          localStorage.setItem('bookmarks', JSON.stringify(bm));
          alert(`✅ Ayat ${n} tersimpan! 🔖`);
        } else {
          alert('ℹ️ Ayat sudah tersimpan');
        }
      } catch (e) {}
    },

    installApp() {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then(r => {
          window.deferredPrompt = null;
        });
      } else {
        alert('ℹ️ Aplikasi sudah terinstall atau browser tidak mendukung PWA');
      }
    },

    async requestNotificationPermission() {
      if (Notification.permission === 'granted') {
        const saved = localStorage.getItem('fcm_token');
        if (saved) {
          alert('✅ Notifikasi sudah aktif!\n\n' + JSON.parse(saved).token.substring(0, 50) + '...');
        } else {
          await initFCM();
        }
        return;
      }
      
      if (Notification.permission === 'denied') {
        alert('❌ Izin ditolak.\n\nAktifkan dari pengaturan browser');
        return;
      }

      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') {
          alert('✅ Izin diberikan! Sedang setup...');
          setTimeout(() => initFCM(), 1000);
        }
      } catch (err) {
        alert('❌ Error: ' + err.message);
      }
    },

    async registerServiceWorker() {
      if (!('serviceWorker' in navigator)) return;
      try {
        await navigator.serviceWorker.register('/platform/barakahku1/service-worker.js', { 
          scope: '/platform/barakahku1/' 
        });
        console.log('✅ SW registered');
      } catch (err) {
        console.error('SW error:', err);
      }
    },

    loadLastRead() {
      const s = localStorage.getItem('lastRead');
      if (s) {
        try { this.lastRead = JSON.parse(s); } catch (e) {}
      }
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
      try {
        const { latitude, longitude } = this.userCoords;
        const q = `[out:json];(node["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${latitude},${longitude});way["amenity"="place_of_worship"]["religion"="muslim"](around:2000,${latitude},${longitude}););out body;`;
        const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
        const data = await res.json();
        this.nearbyMosques = data.elements
          .filter(e => e.tags?.name)
          .map(e => ({
            name: e.tags.name,
            address: e.tags['addr:full'] || e.tags['addr:street'] || 'Alamat tidak tersedia',
            lat: e.lat || e.center?.lat,
            lon: e.lon || e.center?.lon,
            distance: this.calculateDistance(latitude, longitude, e.lat || e.center?.lat, e.lon || e.center?.lon).toFixed(2)
          }))
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .slice(0, 10);
      } catch (err) {
        alert('❌ Error mencari masjid');
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
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    },

    openGoogleMaps(lat, lon, name) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
    },

    setMood(m) { this.currentMood = m; },
    clearMood() { this.currentMood = null; },

    initDarkMode() {
      this.darkMode = localStorage.getItem('darkMode') === 'true';
      if (this.darkMode) document.documentElement.classList.add('dark');
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    }
  }));
});

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  window.deferredPrompt = e;
});

window.manualInitFCM = () => initFCM();

console.log('✅ App loaded | Run: window.manualInitFCM()');