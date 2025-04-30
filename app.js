let cart = [];
let currentTheme = localStorage.getItem('theme') || 'light';

const products = {
    pizza: [
        {id: 1, name: 'Маргарита', price: 450, icon: 'fa-solid fa-pizza-slice', iconColor: '#E74C3C', rating: 4.5, popular: true},
        {id: 2, name: 'Пепперони', price: 550, icon: 'fa-solid fa-bacon', iconColor: '#C0392B', rating: 4.8, popular: true},
        {id: 3, name: '4 Сыра', price: 580, icon: 'fa-solid fa-cheese', iconColor: '#F1C40F', rating: 4.7},
        {id: 4, name: 'Гавайская', price: 520, icon: 'fa-solid fa-pineapple', iconColor: '#2ECC71', rating: 4.2},
    ],
    drinks: [
        {id: 5, name: 'Кола', price: 120, icon: 'fa-solid fa-bottle-water', iconColor: '#3498DB', rating: 4.0},
        {id: 6, name: 'Лимонад', price: 100, icon: 'fa-solid fa-glass-water', iconColor: '#1ABC9C', rating: 4.3},
        {id: 7, name: 'Чай', price: 80, icon: 'fa-solid fa-mug-hot', iconColor: '#E67E22', rating: 4.1},
        {id: 8, name: 'Кофе', price: 120, icon: 'fa-solid fa-coffee', iconColor: '#8B4513', rating: 4.6},
    ]
};

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-theme', currentTheme);
    renderProducts('pizza');
    
    // Категории
    document.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('[data-category]').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            renderProducts(button.dataset.category);
            document.getElementById('search-input').value = '';
        });
    });
    
    // Активная кнопка "Пицца" по умолчанию
    document.querySelector('[data-category="pizza"]').classList.add('active');
});

// Рендер продуктов
function renderProducts(category) {
    const container = document.getElementById('product-list');
    container.innerHTML = products[category].map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-icon" style="color: ${product.iconColor}">
                <i class="${product.icon}"></i>
            </div>
            <div class="product-info">
                <h3>${product.name} ${product.popular ? '<span class="popular-badge">🔥</span>' : ''}</h3>
                <div class="rating">
                    ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} ${product.rating}
                </div>
                <p>${product.price} ₽</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">В корзину</button>
            </div>
        </div>
    `).join('');
}

// Поиск
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length < 2) {
        const activeCategory = document.querySelector('[data-category].active');
        if (activeCategory) renderProducts(activeCategory.dataset.category);
        return;
    }
    
    const allProducts = [...products.pizza, ...products.drinks];
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    
    const container = document.getElementById('product-list');
    container.innerHTML = filtered.map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-icon" style="color: ${product.iconColor}">
                <i class="${product.icon}"></i>
            </div>
            <div>
                <h3>${product.name}</h3>
                <p>${product.price} ₽</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">В корзину</button>
            </div>
        </div>
    `).join('');
});

// Корзина
function addToCart(productId) {
    const product = [...products.pizza, ...products.drinks].find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }
    
    updateCart();
    showNotification(`${product.name} добавлен в корзину`);
    document.getElementById('cart-count').classList.add('pulse');
    setTimeout(() => {
        document.getElementById('cart-count').classList.remove('pulse');
    }, 500);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showNotification('Товар удалён из корзины');
}

function changeQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = (item.quantity || 1) + delta;
        if (item.quantity < 1) {
            removeFromCart(productId);
            return;
        }
        updateCart();
    }
}

function updateCart() {
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.getElementById('cart-count').textContent = count;
    
    document.getElementById('cart-items').innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <h4>${item.name}</h4>
                <p>${item.price} ₽ × ${item.quantity || 1} = ${item.price * (item.quantity || 1)} ₽</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="event.stopPropagation(); changeQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity || 1}</span>
                <button onclick="event.stopPropagation(); changeQuantity(${item.id}, 1)">+</button>
                <button onclick="event.stopPropagation(); removeFromCart(${item.id})">×</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    document.querySelector('.checkout-btn').innerHTML = `Оформить заказ (${total} ₽)`;
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

// Телефон
function callPhone() {
    if (confirm('Позвонить по номеру +7 (930) 167-83-26?')) {
        const phoneLink = document.createElement('a');
        phoneLink.href = 'tel:+79301678326';
        document.body.appendChild(phoneLink);
        phoneLink.click();
        document.body.removeChild(phoneLink);
        
        const callBtn = document.querySelector('.call-btn');
        callBtn.innerHTML = '<i class="fas fa-phone"></i> Звонок...';
        callBtn.style.background = '#2ecc71';
        
        setTimeout(() => {
            callBtn.innerHTML = '<i class="fas fa-phone"></i> Позвонить';
            callBtn.style.background = 'var(--secondary)';
        }, 3000);
    }
}

// Поиск
function toggleSearch() {
    document.getElementById('search-container').classList.toggle('active');
    if (document.getElementById('search-container').classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
}

// Уведомления
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Тема
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
}

// Оформление заказа
async function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const itemsText = cart.map(item => 
        `${item.name} - ${item.quantity || 1} × ${item.price} ₽ = ${(item.quantity || 1) * item.price} ₽`
    ).join('%0A');
    
    const message = `Новый заказ:%0A%0A${itemsText}%0A%0AИтого: ${total} ₽`;
    
    const botToken = '8195704085:AAHMBHP0g906T86Q0w0gW7cMsCvpFq-yw1g';
    const chatId = '7699424458';
    
    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${message}`);
        showNotification('Заказ оформлен! С вами свяжутся в Telegram');
        cart = [];
        updateCart();
    } catch (error) {
        console.error('Ошибка при отправке заказа:', error);
        showNotification('Ошибка при оформлении заказа');
    }
}
