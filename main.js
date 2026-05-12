/* ============================================
   ТОВАРЫ (БАЗА ДАННЫХ)
   ============================================ */
const products = [
    { id: 1, name: 'iPhone 15 Pro', price: 99990, category: 'electronics', image: 'image/iPhone 15 Pro.jpg', rating: 5, discount: 0 },
    { id: 2, name: 'Samsung Galaxy S24', price: 89990, category: 'electronics', image: 'image/i.webp', rating: 4.5, discount: 10 },
    { id: 3, name: 'MacBook Air M3', price: 119990, category: 'electronics', image: 'image/iMacBook Air M3.webp', rating: 5, discount: 0 },
    { id: 4, name: 'PlayStation 5', price: 59990, category: 'electronics', image: 'image/PlayStation 5.webp', rating: 4.8, discount: 5 },
    { id: 5, name: 'AirPods Pro 2', price: 24990, category: 'audio', image: 'image/AirPods Pro 2.webp', rating: 4.7, discount: 0 },
    { id: 6, name: 'Монитор 27" 4K', price: 39990, category: 'accessories', image: 'image/monitor-hp-series-7-pro-727pk-8j9g2aa-chernyiy_2-750x750.jpg', rating: 4.6, discount: 15 },
    { id: 7, name: 'Клавиатура Mechanical', price: 8990, category: 'accessories', image: 'image/Клавиатура Mechanical.webp', rating: 4.4, discount: 0 },
    { id: 8, name: 'Мышь Logitech MX', price: 7990, category: 'accessories', image: 'image/1.webp', rating: 4.9, discount: 0 },
    { id: 9, name: 'Sony WH-1000XM5', price: 34990, category: 'audio', image: 'image/Sony WH-1000XM5.webp', rating: 4.9, discount: 20 },
];

/* ============================================
   КОРЗИНА (localStorage)
   ============================================ */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    showToast(`✅ ${product.name} добавлен в корзину!`);
    
    // Анимация иконки корзины
    document.querySelectorAll('#cartCount').forEach(el => {
        el.classList.add('cart-bump');
        setTimeout(() => el.classList.remove('cart-bump'), 300);
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartModal();
    showToast('🗑️ Товар удален из корзины');
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCartModal();
        }
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCartModal() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="text-center text-muted">Корзина пуста</p>';
        cartTotalSpan.textContent = '0';
        return;
    }
    
    cartItemsDiv.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <div>
                <h6 class="mb-0">${item.name}</h6>
                <small class="text-muted">${item.price.toLocaleString()} ₽</small>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="fw-bold">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="fw-bold">${(item.price * item.quantity).toLocaleString()} ₽</div>
        </div>
    `).join('');
    
    cartTotalSpan.textContent = getCartTotal().toLocaleString();
}

/* ============================================
   РЕНДЕР ТОВАРОВ (Каталог)
   ============================================ */
let currentProducts = [...products];
let currentPage = 1;
const itemsPerPage = 6;

function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = currentProducts.slice(start, start + itemsPerPage);
    
    container.innerHTML = paginatedProducts.map(product => {
        const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="product-card card h-100">
                    ${product.discount > 0 ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
                    <img src="${product.image}" class="product-image" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <div class="mb-2">
                            ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating}
                        </div>
                        <div class="product-price">
                            ${Math.round(discountedPrice).toLocaleString()} ₽
                            ${product.discount > 0 ? `<span class="old-price">${product.price.toLocaleString()} ₽</span>` : ''}
                        </div>
                        <button class="btn btn-primary w-100 mt-3" onclick="addToCart(${product.id})">
                            <i class="bi bi-cart-plus"></i> В корзину
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination();
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;
    
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    paginationDiv.innerHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Назад</a>
        </li>
        ${pagesHtml}
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Вперед</a>
        </li>
    `;
}

function changePage(page) {
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function filterAndSort() {
    let filtered = [...products];
    
    // Фильтр по категории
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked'))
        .map(cb => cb.value);
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    
    // Фильтр по цене
    const maxPrice = parseInt(document.getElementById('priceFilter')?.value || 150000);
    filtered = filtered.filter(p => p.price <= maxPrice);
    
    // Сортировка
    const sortValue = document.getElementById('sortSelect')?.value;
    if (sortValue === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'name-asc') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    currentProducts = filtered;
    currentPage = 1;
    renderProducts();
}

/* ============================================
   ГЛАВНАЯ СТРАНИЦА - ПОПУЛЯРНЫЕ ТОВАРЫ
   ============================================ */
function renderPopularProducts() {
    const container = document.getElementById('popularProducts');
    if (!container) return;
    
    const popular = products.slice(0, 3);
    
    container.innerHTML = popular.map(product => `
        <div class="col-md-4 mb-4">
            <div class="product-card card h-100">
                <img src="${product.image}" class="product-image" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <button class="btn btn-primary w-100 mt-3" onclick="addToCart(${product.id})">
                        <i class="bi bi-cart-plus"></i> В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/* ============================================
   ПРОФИЛЬ / НАСТРОЙКИ
   ============================================ */
function initProfile() {
    const regDate = localStorage.getItem('regDate');
    if (!regDate) {
        localStorage.setItem('regDate', new Date().toLocaleDateString('ru-RU'));
    }
    const regDateInput = document.getElementById('userRegDate');
    if (regDateInput) {
        regDateInput.value = localStorage.getItem('regDate');
    }
    
    // Загрузка настроек
    const theme = localStorage.getItem('theme') || 'light';
    document.getElementById('themeSelect').value = theme;
    if (theme === 'dark') document.body.classList.add('dark-theme');
    
    const notifications = localStorage.getItem('notifications') === 'true';
    document.getElementById('notificationsToggle').checked = notifications;
    
    // Загрузка заказов
    renderOrders();
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="text-center text-muted">У вас пока нет заказов</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="border rounded p-3 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>Заказ #${order.id}</strong>
                <span class="badge bg-success">${order.status}</span>
            </div>
            <div class="text-muted small">${order.date}</div>
            <div class="mt-2">${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
            <div class="fw-bold mt-2">Сумма: ${order.total.toLocaleString()} ₽</div>
        </div>
    `).join('');
}

function checkout() {
    if (cart.length === 0) {
        showToast('Корзина пуста!', 'warning');
        return;
    }
    
    const order = {
        id: Date.now(),
        date: new Date().toLocaleString('ru-RU'),
        items: [...cart],
        total: getCartTotal(),
        status: 'Оплачен'
    };
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    cart = [];
    saveCart();
    renderCartModal();
    showToast('Заказ оформлен! Спасибо за покупку! 🎉');
    
    // Закрыть модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (modal) modal.hide();
}

/* ============================================
   TOAST УВЕДОМЛЕНИЯ
   ============================================ */
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    if (!toastEl) return;
    
    const toastBody = document.getElementById('toastMessage');
    const toastHeader = toastEl.querySelector('.toast-header');
    
    toastBody.textContent = message;
    
    if (type === 'success') {
        toastHeader.className = 'toast-header bg-success text-white';
    } else if (type === 'error') {
        toastHeader.className = 'toast-header bg-danger text-white';
    } else {
        toastHeader.className = 'toast-header bg-warning text-dark';
    }
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

/* ============================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderPopularProducts();
    
    // Каталог страница
    if (document.getElementById('productsContainer')) {
        renderProducts();
        
        // События фильтров
        const applyBtn = document.getElementById('applyFilters');
        if (applyBtn) applyBtn.addEventListener('click', filterAndSort);
        
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.querySelectorAll('.filter-category:checked').forEach(cb => cb.checked = false);
                document.getElementById('priceFilter').value = 50000;
                document.getElementById('priceValue').textContent = '50000';
                document.getElementById('sortSelect').value = 'default';
                filterAndSort();
            });
        }
        
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            priceFilter.addEventListener('input', (e) => {
                document.getElementById('priceValue').textContent = e.target.value;
            });
        }
        
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) sortSelect.addEventListener('change', filterAndSort);
    }
    
    // Профиль страница
    initProfile();
    
    // Сохранение профиля
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Данные профиля сохранены!');
        });
    }
    
    // Сохранение настроек
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const theme = document.getElementById('themeSelect').value;
            const notifications = document.getElementById('notificationsToggle').checked;
            
            localStorage.setItem('theme', theme);
            localStorage.setItem('notifications', notifications);
            
            if (theme === 'dark') {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
            
            showToast('Настройки сохранены!');
        });
    }
    
    // Переключение табов в профиле
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.dataset.tab;
            
            document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.getElementById('profileTab').style.display = 'none';
            document.getElementById('ordersTab').style.display = 'none';
            document.getElementById('settingsTab').style.display = 'none';
            
            if (tabName === 'profile') document.getElementById('profileTab').style.display = 'block';
            if (tabName === 'orders') document.getElementById('ordersTab').style.display = 'block';
            if (tabName === 'settings') document.getElementById('settingsTab').style.display = 'block';
        });
    });
    
    // Кнопка оформления заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    
    // Выход
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cart = [];
            saveCart();
            localStorage.removeItem('regDate');
            localStorage.removeItem('theme');
            localStorage.removeItem('notifications');
            showToast('Вы вышли из системы');
            setTimeout(() => window.location.href = 'index.html', 1500);
        });
    }
});

// Глобальные функции для onclick
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.changePage = changePage;