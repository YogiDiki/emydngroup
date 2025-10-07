// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Chatbot Functionality
const chatbotBtn = document.getElementById('chatbot-btn');
const chatbotModal = document.getElementById('chatbot-modal');
const closeChatbot = document.getElementById('close-chatbot');
const sendChat = document.getElementById('send-chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Chatbot responses
const botResponses = {
    'halo': 'Halo! Senang bertemu dengan Anda. Ada yang bisa saya bantu?',
    'hai': 'Hai! Ada yang ingin Anda tanyakan tentang Emydn Group?',
    'bisnis': 'Kami memiliki 4 lini bisnis: Sistem & Aplikasi, Edukasi, Esport, dan F&B. Mana yang ingin Anda ketahui lebih lanjut?',
    'sistem': 'Lini bisnis Sistem & Aplikasi kami fokus pada pengembangan software, aplikasi mobile, dan sistem enterprise. Silakan kunjungi halaman Bisnis Kami untuk info lengkap!',
    'edukasi': 'Kami menyediakan platform pembelajaran online dan pelatihan profesional. Kunjungi halaman Bisnis Kami untuk mengetahui lebih lanjut!',
    'esport': 'Divisi Esport kami mengelola tim profesional dan menyelenggarakan turnamen. Tertarik bergabung?',
    'fnb': 'Bisnis F&B kami menawarkan konsep kuliner modern dan inovatif. Cek halaman Bisnis Kami untuk detail!',
    'kontak': 'Anda bisa menghubungi kami melalui WhatsApp di +62 858-1967-2814 atau email di info@emydngroup.com',
    'alamat': 'Kantor kami berlokasi di Jakarta, Indonesia. Untuk informasi lebih lanjut, kunjungi halaman Kontak.',
    'terima kasih': 'Sama-sama! Senang bisa membantu Anda 😊',
    'default': 'Maaf, saya belum mengerti pertanyaan Anda. Silakan hubungi tim kami melalui WhatsApp atau halaman Kontak untuk bantuan lebih lanjut.'
};

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    for (let key in botResponses) {
        if (lowerMessage.includes(key)) {
            return botResponses[key];
        }
    }
    return botResponses['default'];
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${isUser ? 'text-right' : 'text-left'}`;
    
    const messageContent = document.createElement('p');
    messageContent.className = `inline-block p-3 rounded-lg ${
        isUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
    }`;
    messageContent.textContent = text;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (chatbotBtn) {
    chatbotBtn.addEventListener('click', () => {
        chatbotModal.classList.toggle('hidden');
    });
}

if (closeChatbot) {
    closeChatbot.addEventListener('click', () => {
        chatbotModal.classList.add('hidden');
    });
}

if (sendChat) {
    sendChat.addEventListener('click', sendMessage);
}

if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, true);
        chatInput.value = '';
        
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response, false);
        }, 500);
    }
}

// Scroll to Top Button
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

// Animation on Scroll
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

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('section > div');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});