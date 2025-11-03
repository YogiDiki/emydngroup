// Data Produk
const products = [
    { id: 1, name: "Nasi Goreng Spesial", price: 25000, category: "makanan", stock: 10 },
    { id: 2, name: "Mie Ayam Bakso", price: 20000, category: "makanan", stock: 8 },
    { id: 3, name: "Gado-gado", price: 18000, category: "makanan", stock: 12 },
    { id: 4, name: "Es Teh Manis", price: 8000, category: "minuman", stock: 20 },
    { id: 5, name: "Kopi Hitam", price: 12000, category: "minuman", stock: 15 },
    { id: 6, name: "Jus Jeruk", price: 15000, category: "minuman", stock: 10 },
    { id: 7, name: "Kerupuk", price: 5000, category: "snack", stock: 25 },
    { id: 8, name: "Pisang Goreng", price: 10000, category: "snack", stock: 18 }
];

// Data Transaksi Dummy yang Lengkap
const dummyTransactions = [
    {
        id: 1,
        date: '2024-01-01T08:30:00',
        outlet: 'pusat',
        items: [
            { id: 1, name: "Nasi Goreng Spesial", price: 25000, quantity: 2 },
            { id: 4, name: "Es Teh Manis", price: 8000, quantity: 2 }
        ],
        subtotal: 66000,
        tax: 6600,
        discount: 0,
        total: 72600
    },
    {
        id: 2,
        date: '2024-01-01T12:15:00',
        outlet: 'pusat',
        items: [
            { id: 2, name: "Mie Ayam Bakso", price: 20000, quantity: 1 },
            { id: 5, name: "Kopi Hitam", price: 12000, quantity: 1 },
            { id: 7, name: "Kerupuk", price: 5000, quantity: 1 }
        ],
        subtotal: 37000,
        tax: 3700,
        discount: 0,
        total: 40700
    },
    {
        id: 3,
        date: '2024-01-02T09:45:00',
        outlet: 'cabang1',
        items: [
            { id: 3, name: "Gado-gado", price: 18000, quantity: 3 },
            { id: 6, name: "Jus Jeruk", price: 15000, quantity: 2 }
        ],
        subtotal: 84000,
        tax: 8400,
        discount: 0,
        total: 92400
    },
    {
        id: 4,
        date: '2024-01-02T14:20:00',
        outlet: 'cabang1',
        items: [
            { id: 1, name: "Nasi Goreng Spesial", price: 25000, quantity: 1 },
            { id: 8, name: "Pisang Goreng", price: 10000, quantity: 3 }
        ],
        subtotal: 55000,
        tax: 5500,
        discount: 0,
        total: 60500
    },
    {
        id: 5,
        date: '2024-01-03T11:10:00',
        outlet: 'pusat',
        items: [
            { id: 4, name: "Es Teh Manis", price: 8000, quantity: 5 },
            { id: 7, name: "Kerupuk", price: 5000, quantity: 3 }
        ],
        subtotal: 55000,
        tax: 5500,
        discount: 0,
        total: 60500
    },
    {
        id: 6,
        date: '2024-01-03T18:30:00',
        outlet: 'cabang2',
        items: [
            { id: 2, name: "Mie Ayam Bakso", price: 20000, quantity: 2 },
            { id: 4, name: "Es Teh Manis", price: 8000, quantity: 3 },
            { id: 8, name: "Pisang Goreng", price: 10000, quantity: 2 }
        ],
        subtotal: 84000,
        tax: 8400,
        discount: 0,
        total: 92400
    }
];

// Data Transaksi (HANYA yang dari user)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentCart = JSON.parse(localStorage.getItem('currentCart')) || [];
let currentDiscount = JSON.parse(localStorage.getItem('currentDiscount')) || { type: null, value: 0 };
let currentDataMode = 'real'; // 'real' or 'dummy'
let salesChart = null;
let productChart = null;

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const discountElement = document.getElementById('discount');
const grandTotalElement = document.getElementById('grandTotal');
const categoryButtons = document.querySelectorAll('.category-btn');
const outletSelect = document.getElementById('outletSelect');
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadProducts();
    loadCart();
    updateCartDisplay();
    setupEventListeners();
    setupLogo();
    
    // Set tanggal default untuk filter (7 hari terakhir)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    document.getElementById('startDate').value = sevenDaysAgo.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    // Load report data
    loadReportData();
}

// Setup Logo
function setupLogo() {
    const logoImg = document.getElementById('receiptLogo');
    const logoPlaceholder = document.querySelector('.logo-placeholder');
    
    if (logoImg) {
        logoImg.onerror = function() {
            this.style.display = 'none';
            if (logoPlaceholder) logoPlaceholder.style.display = 'block';
        };
        
        logoImg.onload = function() {
            if (logoPlaceholder) logoPlaceholder.style.display = 'none';
            this.style.display = 'block';
        };
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            switchSection(target);
        });
    });

    // Category Filter
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            filterProducts(category);
        });
    });

    // Outlet Change
    outletSelect.addEventListener('change', function() {
        console.log('Outlet berubah:', this.value);
    });

    // Payment Methods
    document.querySelectorAll('.payment-btn').forEach(button => {
        button.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            processPayment(method);
        });
    });

    // Action Buttons
    document.getElementById('selesaiBtn').addEventListener('click', completeTransaction);
    document.getElementById('resetBtn').addEventListener('click', resetTransaction);
    document.getElementById('applyVoucher').addEventListener('click', applyVoucher);

    // Data Toggle
    document.getElementById('showRealData').addEventListener('click', () => switchDataMode('real'));
    document.getElementById('showDummyData').addEventListener('click', () => switchDataMode('dummy'));

    // Laporan
    document.getElementById('filterBtn').addEventListener('click', filterReports);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);

    // Modal Controls
    setupModalControls();
}

// Switch Data Mode
function switchDataMode(mode) {
    currentDataMode = mode;
    
    // Update toggle buttons
    document.getElementById('showRealData').classList.toggle('active', mode === 'real');
    document.getElementById('showDummyData').classList.toggle('active', mode === 'dummy');
    
    // Update data info
    document.getElementById('dataInfo').textContent = `Menampilkan data ${mode === 'real' ? 'real' : 'demo'}`;
    
    // Reload report data
    loadReportData();
    
    showNotification(`📊 Menampilkan ${mode === 'real' ? 'data real' : 'data demo'}`);
}

// Load Products
function loadProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = `product-card ${product.stock === 0 ? 'out-of-stock' : ''}`;
        productCard.setAttribute('data-category', product.category);
        productCard.setAttribute('data-id', product.id);
        
        productCard.innerHTML = `
            <div class="product-name">${product.name}</div>
            <div class="product-price">Rp ${formatNumber(product.price)}</div>
            <div class="product-stock">Stok: ${product.stock}</div>
        `;
        
        if (product.stock > 0) {
            productCard.addEventListener('click', () => addToCart(product.id));
        }
        
        productGrid.appendChild(productCard);
    });
}

// Filter Products by Category
function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existingItem = currentCart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('Stok tidak mencukupi!');
            return;
        }
    } else {
        currentCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    updateCartDisplay();
}

function removeFromCart(productId) {
    currentCart = currentCart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

function updateQuantity(productId, newQuantity) {
    const item = currentCart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item && product) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= product.stock) {
            item.quantity = newQuantity;
            saveCart();
            updateCartDisplay();
        } else {
            alert('Stok tidak mencukupi!');
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (currentCart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <p>Keranjang kosong</p>
                <small>Pilih produk dari katalog untuk mulai transaksi</small>
            </div>
        `;
        document.getElementById('selesaiBtn').disabled = true;
    } else {
        document.getElementById('selesaiBtn').disabled = false;
        
        currentCart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">Rp ${formatNumber(item.price)}</div>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                           onchange="updateQuantity(${item.id}, parseInt(this.value))">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">Rp ${formatNumber(item.price * item.quantity)}</div>
                <button class="btn-secondary" onclick="removeFromCart(${item.id})" style="margin-left: 10px; padding: 0.25rem 0.5rem; font-size: 0.8rem;">Hapus</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    updateTotals();
}

function updateTotals() {
    const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    let discount = 0;
    
    if (currentDiscount.type === 'percentage') {
        discount = subtotal * (currentDiscount.value / 100);
    } else if (currentDiscount.type === 'fixed') {
        discount = currentDiscount.value;
    }
    
    const grandTotal = Math.max(0, subtotal + tax - discount);
    
    subtotalElement.textContent = `Rp ${formatNumber(subtotal)}`;
    taxElement.textContent = `Rp ${formatNumber(tax)}`;
    discountElement.textContent = `Rp ${formatNumber(discount)}`;
    grandTotalElement.textContent = `Rp ${formatNumber(grandTotal)}`;
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    if (notification && messageElement) {
        messageElement.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.5s ease-out';
        }, 100);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => {
                notification.classList.remove('show');
                notification.classList.add('hidden');
            }, 500);
        }, 3000);
    }
}

// Voucher Functions
function applyVoucher() {
    const voucherCode = document.getElementById('voucherCode').value.trim();
    
    if (voucherCode === 'EMYDNPOS') {
        currentDiscount = { type: 'percentage', value: 10 };
        saveDiscount();
        updateTotals();
        
        showNotification('🎉 Voucher berhasil digunakan! Diskon 10% diterapkan.');
        
        discountElement.classList.add('bounce');
        setTimeout(() => {
            discountElement.classList.remove('bounce');
        }, 1000);
        
    } else if (voucherCode === '') {
        showNotification('⚠️ Masukkan kode voucher terlebih dahulu.', 'warning');
    } else {
        showNotification('❌ Kode voucher tidak valid. Gunakan "EMYDNPOS" untuk diskon 10%.', 'warning');
    }
}

// Payment Processing
function processPayment(method) {
    if (currentCart.length === 0) {
        showNotification('⚠️ Keranjang belanja kosong!', 'warning');
        return;
    }
    
    if (method === 'qris') {
        openQRISModal();
    } else if (method === 'tunai') {
        completeTransaction();
    }
}

function openQRISModal() {
    document.getElementById('qrisModal').style.display = 'block';
    
    document.getElementById('simulatePayment').onclick = function() {
        completeTransaction();
        document.getElementById('qrisModal').style.display = 'none';
    };
}

// Complete Transaction
function completeTransaction() {
    if (currentCart.length === 0) return;
    
    const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const discount = currentDiscount.type === 'percentage' ? 
        subtotal * (currentDiscount.value / 100) : 
        (currentDiscount.value || 0);
    const total = Math.max(0, subtotal + tax - discount);
    
    // Simpan transaksi ke data REAL
    const transaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        outlet: outletSelect.value,
        items: [...currentCart],
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total
    };
    
    transactions.push(transaction);
    saveTransactions();
    
    // Update stok produk
    currentCart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock = Math.max(0, product.stock - cartItem.quantity);
        }
    });
    
    // Tampilkan struk
    showReceipt(transaction);
    
    // Reset HANYA cart, BUKAN transactions
    resetTransaction();
    
    // Reload products untuk update stok
    loadProducts();
    // Update laporan
    loadReportData();
    
    showNotification('✅ Transaksi berhasil! Struk telah dicetak.');
}

function showReceipt(transaction) {
    const modal = document.getElementById('receiptModal');
    const itemsContainer = document.getElementById('receiptItems');
    
    if (!modal || !itemsContainer) return;
    
    // Set informasi struk
    document.getElementById('receiptOutlet').textContent = `Outlet: ${transaction.outlet}`;
    document.getElementById('receiptDate').textContent = `Tanggal: ${new Date(transaction.date).toLocaleString('id-ID')}`;
    
    // Isi item
    itemsContainer.innerHTML = '';
    transaction.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'receipt-item';
        itemElement.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>Rp ${formatNumber(item.price * item.quantity)}</span>
        `;
        itemsContainer.appendChild(itemElement);
    });
    
    // Set total
    document.getElementById('receiptSubtotal').textContent = `Rp ${formatNumber(transaction.subtotal)}`;
    document.getElementById('receiptTax').textContent = `Rp ${formatNumber(transaction.tax)}`;
    document.getElementById('receiptDiscount').textContent = `Rp ${formatNumber(transaction.discount)}`;
    document.getElementById('receiptTotal').textContent = `Rp ${formatNumber(transaction.total)}`;
    
    modal.style.display = 'block';
    
    // Setup tombol cetak
    document.getElementById('printReceipt').onclick = function() {
        window.print();
    };
    
    document.getElementById('savePdf').onclick = function() {
        exportReceiptToPDF(transaction);
    };
}

function resetTransaction() {
    currentCart = [];
    currentDiscount = { type: null, value: 0 };
    document.getElementById('voucherCode').value = '';
    saveCart();
    saveDiscount();
    updateCartDisplay();
}

// Laporan Functions
function loadReportData() {
    const data = currentDataMode === 'real' ? transactions : dummyTransactions;
    updateSummaryCards(data);
    updateCharts(data);
    updateReportTable(data);
}

function updateSummaryCards(data) {
    const totalSales = data.reduce((sum, transaction) => sum + (transaction.total || 0), 0);
    const totalTransactions = data.length;
    const totalTax = data.reduce((sum, transaction) => sum + (transaction.tax || 0), 0);
    
    // Cari produk terlaris
    const productSales = {};
    data.forEach(transaction => {
        transaction.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });
    
    let bestSeller = '-';
    let maxSales = 0;
    for (const [product, sales] of Object.entries(productSales)) {
        if (sales > maxSales) {
            maxSales = sales;
            bestSeller = product;
        }
    }
    
    document.getElementById('totalSales').textContent = `Rp ${formatNumber(totalSales)}`;
    document.getElementById('totalTransactions').textContent = totalTransactions;
    document.getElementById('bestSeller').textContent = bestSeller;
    document.getElementById('totalTax').textContent = `Rp ${formatNumber(totalTax)}`;
}

// Chart Functions
function updateCharts(data) {
    updateSalesChart(data);
    updateProductChart(data);
}

function updateSalesChart(data) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    // Group data by date
    const salesByDate = {};
    data.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('id-ID');
        salesByDate[date] = (salesByDate[date] || 0) + (transaction.total || 0);
    });
    
    const dates = Object.keys(salesByDate).sort();
    const sales = dates.map(date => salesByDate[date]);
    
    // Destroy previous chart
    if (salesChart) {
        salesChart.destroy();
    }
    
    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Penjualan Harian',
                data: sales,
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Trend Penjualan Harian'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Rp ' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function updateProductChart(data) {
    const ctx = document.getElementById('productChart');
    if (!ctx) return;
    
    // Group data by product
    const productSales = {};
    data.forEach(transaction => {
        transaction.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });
    
    const products = Object.keys(productSales);
    const quantities = Object.values(productSales);
    
    // Destroy previous chart
    if (productChart) {
        productChart.destroy();
    }
    
    // Generate colors
    const backgroundColors = [
        '#d32f2f', '#f44336', '#e91e63', '#9c27b0',
        '#673ab7', '#3f51b5', '#2196f3', '#03a9f4'
    ];
    
    productChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: products,
            datasets: [{
                data: quantities,
                backgroundColor: backgroundColors.slice(0, products.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribusi Penjualan Produk'
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function updateReportTable(data) {
    const tableBody = document.querySelector('#reportTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 3rem; color: var(--light-text);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📊</div>
                <p>Tidak ada data transaksi</p>
                <small>${currentDataMode === 'real' ? 'Lakukan transaksi di kasir untuk melihat data real' : 'Data demo tersedia'}</small>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    // Urutkan transaksi dari yang terbaru
    const sortedTransactions = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTransactions.forEach(transaction => {
        transaction.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(transaction.date).toLocaleDateString('id-ID')}</td>
                <td>${transaction.outlet}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>Rp ${formatNumber(item.price)}</td>
                <td>Rp ${formatNumber((item.price * item.quantity * 0.10) || 0)}</td>
                <td>Rp ${formatNumber(item.price * item.quantity)}</td>
            `;
            tableBody.appendChild(row);
        });
    });
}

function filterReports() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('⚠️ Pilih tanggal mulai dan tanggal akhir untuk filter.', 'warning');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const data = currentDataMode === 'real' ? transactions : dummyTransactions;
    const filteredData = data.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= start && transactionDate <= end;
    });
    
    // Update dengan data filtered
    updateSummaryCards(filteredData);
    updateCharts(filteredData);
    updateReportTable(filteredData);
    
    showNotification(`📊 Menampilkan ${currentDataMode === 'real' ? 'data real' : 'data demo'} dari ${startDate} hingga ${endDate}`);
}

// Export PDF Function
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const data = currentDataMode === 'real' ? transactions : dummyTransactions;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Judul
    doc.setFontSize(20);
    doc.setTextColor(211, 47, 47);
    doc.text('LAPORAN PENJUALAN EMYDN POS', 105, 15, { align: 'center' });
    
    // Mode Data
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Mode Data: ${currentDataMode === 'real' ? 'Real' : 'Demo'}`, 105, 22, { align: 'center' });
    
    // Periode
    doc.text(`Periode: ${startDate} hingga ${endDate}`, 105, 27, { align: 'center' });
    
    // Tanggal cetak
    const printDate = new Date().toLocaleDateString('id-ID');
    doc.text(`Dicetak pada: ${printDate}`, 105, 32, { align: 'center' });
    
    // Ringkasan
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('RINGKASAN', 20, 45);
    
    const totalSales = data.reduce((sum, t) => sum + (t.total || 0), 0);
    const totalTransactions = data.length;
    const totalTax = data.reduce((sum, t) => sum + (t.tax || 0), 0);
    
    doc.text(`Total Penjualan: Rp ${formatNumber(totalSales)}`, 20, 55);
    doc.text(`Jumlah Transaksi: ${totalTransactions}`, 20, 62);
    doc.text(`Total Pajak: Rp ${formatNumber(totalTax)}`, 20, 69);
    
    // Tabel
    const headers = [['Tanggal', 'Outlet', 'Produk', 'Qty', 'Harga', 'Pajak', 'Total']];
    const tableData = [];
    
    data.forEach(transaction => {
        transaction.items.forEach(item => {
            tableData.push([
                new Date(transaction.date).toLocaleDateString('id-ID'),
                transaction.outlet,
                item.name,
                item.quantity.toString(),
                `Rp ${formatNumber(item.price)}`,
                `Rp ${formatNumber(item.price * item.quantity * 0.10)}`,
                `Rp ${formatNumber(item.price * item.quantity)}`
            ]);
        });
    });
    
    doc.autoTable({
        startY: 80,
        head: headers,
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [211, 47, 47],
            textColor: 255
        },
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        margin: { left: 20, right: 20 }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('© 2024 EMYDN POS - Sistem Kasir Modern', 105, finalY, { align: 'center' });
    
    // Simpan file
    const fileName = `Laporan_Penjualan_${currentDataMode === 'real' ? 'Real' : 'Demo'}_${startDate}_to_${endDate}.pdf`;
    doc.save(fileName);
    
    showNotification('✅ Laporan berhasil diexport ke PDF!');
}

function exportReceiptToPDF(transaction) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        format: [80, 200]
    });
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(211, 47, 47);
    doc.text('EMYDN POS', 40, 10, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Sistem Kasir Modern', 40, 15, { align: 'center' });
    doc.text(`Outlet: ${transaction.outlet}`, 40, 20, { align: 'center' });
    doc.text(`Tanggal: ${new Date(transaction.date).toLocaleString('id-ID')}`, 40, 25, { align: 'center' });
    
    // Garis pemisah
    doc.line(10, 30, 70, 30);
    
    // Items
    let yPosition = 40;
    transaction.items.forEach(item => {
        const itemText = `${item.name} x${item.quantity}`;
        const priceText = `Rp ${formatNumber(item.price * item.quantity)}`;
        
        doc.setFontSize(8);
        doc.text(itemText, 10, yPosition);
        doc.text(priceText, 70, yPosition, { align: 'right' });
        yPosition += 5;
    });
    
    // Garis pemisah
    yPosition += 5;
    doc.line(10, yPosition, 70, yPosition);
    yPosition += 10;
    
    // Totals
    doc.setFontSize(8);
    doc.text(`Subtotal: Rp ${formatNumber(transaction.subtotal)}`, 70, yPosition, { align: 'right' });
    yPosition += 5;
    doc.text(`Pajak (10%): Rp ${formatNumber(transaction.tax)}`, 70, yPosition, { align: 'right' });
    yPosition += 5;
    doc.text(`Diskon: Rp ${formatNumber(transaction.discount)}`, 70, yPosition, { align: 'right' });
    yPosition += 5;
    doc.setFontSize(10);
    doc.text(`TOTAL: Rp ${formatNumber(transaction.total)}`, 70, yPosition, { align: 'right' });
    
    // Footer
    yPosition += 15;
    doc.setFontSize(8);
    doc.text('Terima kasih atas kunjungan Anda!', 40, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('www.emydn-pos.com', 40, yPosition, { align: 'center' });
    
    // Simpan file
    const fileName = `Struk_${transaction.id}.pdf`;
    doc.save(fileName);
    
    showNotification('✅ Struk berhasil disimpan sebagai PDF!');
}

// Utility Functions
function switchSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
    
    navButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-target') === sectionId) {
            button.classList.add('active');
        }
    });
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function setupModalControls() {
    // Close modal ketika klik X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal ketika klik di luar
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Local Storage Functions
function saveCart() {
    localStorage.setItem('currentCart', JSON.stringify(currentCart));
}

function loadCart() {
    const savedCart = localStorage.getItem('currentCart');
    if (savedCart) {
        currentCart = JSON.parse(savedCart);
    }
}

function saveDiscount() {
    localStorage.setItem('currentDiscount', JSON.stringify(currentDiscount));
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}