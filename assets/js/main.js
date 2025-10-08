/// =======================================================
// main.js - Fungsi Utama Website (Ditambahkan Tawk.to Show)
// =======================================================

// --- Fungsionalitas Pencarian Internal ---
window.handleInternalSearch = function(inputId) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) return;
    
    const query = inputElement.value.trim().toLowerCase();

    if (!query) return;

    // Logika Pencarian untuk Navigasi Halaman
    if (query.includes('makan') || query.includes('food') || query.includes('f&b')) {
        window.location.href = '/business/fnb.html';
    } else if (query.includes('edukasi') || query.includes('belajar') || query.includes('education')) {
        window.location.href = '/business/education.html';
    } else if (query.includes('sistem') || query.includes('aplikasi') || query.includes('system') || query.includes('website')) {
        window.location.href = '/business/system.html';
    } else if (query.includes('esport') || query.includes('game')) {
        window.location.href = '/business/esport.html';
    } else if (query.includes('kontak') || query.includes('hubungi')) {
        window.location.href = '/contact.html';
    } else if (query.includes('tentang') || query.includes('about')) {
        window.location.href = '/about.html';
    } else if (query.includes('bisnis') || query.includes('line of business') || query.includes('lob')) {
        window.location.href = '/line-of-business.html';
    } else {
        console.log('Pencarian: Hasil pencarian tidak ditemukan. Coba kata kunci yang lebih umum.');
    }

    // Tutup menu mobile setelah pencarian
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menu-icon');
    if (mobileMenu && menuIcon) {
        mobileMenu.classList.add('hidden');
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
    }
}

// === Fungsi Utama yang Dijalankan Setelah DOM Dimuat ===
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Inisiasi Fungsionalitas Header ---
    initHeaderFunctionality();

    // --- 2. SOLUSI: Memastikan Tawk.to Tetap Terlihat ---
    if (typeof Tawk_API !== 'undefined') {
        // Tawk.to API ready, paksa widget untuk muncul
        Tawk_API.showWidget(); 
        Tawk_API.maximize(); // Opsional: Memaksimalkan jendela chat (hapus jika hanya ingin ikon)
        Tawk_API.onLoad = function(){
            // Memastikan tetap muncul setelah Tawk.to selesai loading
            Tawk_API.showWidget();
            Tawk_API.maximize();
        };
    }


    // --- 3. Inisiasi Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });


    // --- 4. Animation on Scroll ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('section > div');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // --- 5. Scroll (dipertahankan) ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    });
});


// === Fungsionalitas Header yang Terpisah ===
function initHeaderFunctionality() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menu-icon');

    // 1. Toggle Menu Mobile
    if (menuBtn && mobileMenu && menuIcon) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileMenu.classList.contains('hidden')) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            } else {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            }
        });

        // Tutup menu mobile saat klik link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            });
        });
    }

    // 2. Fungsionalitas Tombol Search
    const searchBtn = document.getElementById('searchBtn');
    const searchBtnMobile = document.getElementById('searchBtnMobile');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => handleInternalSearch('searchInput'));
    }
    if (searchBtnMobile) {
        searchBtnMobile.addEventListener('click', () => handleInternalSearch('searchInputMobile'));
    }
}