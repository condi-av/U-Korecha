let cart = [];
let currentTheme = localStorage.getItem('theme') || 'light';

const products = {
    pizza: [
        {
            id: 1, 
            name: 'Маргарита', 
            price: 450, 
            icon: 'fa-solid fa-pizza-slice', 
            iconColor: '#E74C3C', 
            rating: 4.7,
            popular: true,
            ingredients: 'Томатный соус, моцарелла, свежий базилик, оливковое масло'
        },
        {
            id: 2, 
            name: 'Пепперони', 
            price: 550, 
            icon: 'fa-solid fa-bacon', 
            iconColor: '#C0392B', 
            rating: 4.9,
            popular: true,
            ingredients: 'Томатный соус, моцарелла, пепперони, орегано'
        },
        {
            id: 3, 
            name: '4 Сыра', 
            price: 580, 
            icon: 'fa-solid fa-cheese', 
            iconColor: '#F1C40F', 
            rating: 4.6,
            ingredients: 'Сливочный соус, моцарелла, горгонзола, пармезан, эдам'
        },
        {
            id: 4, 
            name: 'Гавайская', 
            price: 520, 
            icon: 'fa-solid fa-pineapple', 
            iconColor: '#2ECC71', 
            rating: 4.2,
            ingredients: 'Томатный соус, моцарелла, курица, ананасы, сладкий перец'
        },
        {
            id: 9,
            name: 'Карбонара',
            price: 570,
            icon: 'fa-solid fa-bacon',
            iconColor: '#E67E22',
            rating: 4.5,
            ingredients: 'Сливочный соус, моцарелла, бекон, яйцо, пармезан, чеснок'
        }
    ],
    drinks: [
        {
            id: 5, 
            name: 'Кола', 
            price: 120, 
            icon: 'fa-solid fa-bottle-water', 
            iconColor: '#3498DB', 
            rating: 4.0,
            volume: '0.5л'
        },
        {
            id: 6, 
            name: 'Лимонад', 
            price: 100, 
            icon: 'fa-solid fa-glass-water', 
            iconColor: '#1ABC9C', 
            rating: 4.3,
            volume: '0.5л',
            ingredients: 'Натуральный лимонный сок, мята, лайм'
        },
        {
            id: 7, 
            name: 'Чай', 
            price: 80, 
            icon: 'fa-solid fa-mug-hot', 
            iconColor: '#E67E22', 
            rating: 4.1,
            volume: '0.3л'
        },
        {
            id: 8, 
            name: 'Кофе', 
            price: 120, 
            icon: 'fa-solid fa-coffee', 
            iconColor: '#8B4513', 
            rating: 4.6,
            volume: '0.2л'
        },
        {
            id: 10,
            name: 'Морс',
            price: 90,
            icon: 'fa-solid fa-glass-water',
            iconColor: '#9B59B6',
            rating: 4.4,
            volume: '0.4л',
            ingredients: 'Ягодный микс, мёд, мята'
        }
    ]
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-theme', currentTheme);
    renderProducts('pizza');
    
    // Обработчики для кнопок категорий
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

// Рендер списка продуктов
function renderProducts(category) {
    const container = document.getElementById('product-list');
    container.innerHTML = products[category].map(product => `
        <div class="product-card" onclick="addToCart(${product.id})">
            <div class="product-icon" style="color: ${product.iconColor}">
                <i class="${product.icon}"></i>
            </div>
            <div class="product-info">
                <div class="product-title">
                    <h3>${product.name}</h3>
                    ${product.popular ? '<span class="popular-badge">🔥</span>' : ''}
                </div>
                <div class="rating">
                    ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} ${product.rating}
                </div>
                <p>${product.price} ₽ ${product.volume ? `· ${product.volume}` : ''}</p>
                <p class="product-ingredients">${product.ingredients || ''}</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-plus"></i> В корзину
                </button>
            </div>
        </div>
    `).join('');
}

// Поиск продуктов
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
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.price} ₽ ${product.volume ? `· ${product.volume}` : ''}</p>
                <p class="product-ingredients">${product.ingredients || ''}</p>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-plus"></i> В корзину
                </button>
            </div>
        </div>
    `).join('');
});

// Функции корзины
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
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-total-price').textContent = `${total} ₽`;
    
    document.getElementById('cart-items').innerHTML = cart.length > 0 
        ? cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">${item.price * (item.quantity || 1)} ₽</span>
                </div>
                ${item.ingredients ? `<p class="cart-item-ingredients">${item.ingredients}</p>` : ''}
                ${item.volume ? `<p class="cart-item-ingredients">${item.volume}</p>` : ''}
                <div class="cart-item-controls">
                    <button onclick="event.stopPropagation(); changeQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity || 1}</span>
                    <button onclick="event.stopPropagation(); changeQuantity(${item.id}, 1)">+</button>
                    <button onclick="event.stopPropagation(); removeFromCart(${item.id})">Удалить</button>
                </div>
            </div>
        `).join('')
        : '<div class="empty-cart">Корзина пуста</div>';
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

// Функции телефона
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

// Функции поиска
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

// Переключение темы
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    const themeIcon = document.querySelector('.theme-switcher i');
    themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Оформление заказа
function checkout() {
    if (cart.length === 0) {
        showNotification('Корзина пуста!');
        return;
    }

    // Показываем модальное окно оформления
    document.getElementById('checkout-modal').classList.add('active');
    
    // Заполняем сводку заказа
    const orderSummary = document.getElementById('order-summary');
    const itemsHtml = cart.map(item => `
        <div class="order-summary-item">
            <span>${item.name} × ${item.quantity || 1}</span>
            <span>${item.price * (item.quantity || 1)} ₽</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    orderSummary.innerHTML = `
        <h3>Ваш заказ:</h3>
        ${itemsHtml}
        <div class="order-summary-total">
            <span>Итого:</span>
            <span>${total} ₽</span>
        </div>
    `;
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').classList.remove('active');
}

async function confirmOrder() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('delivery-address').value.trim();
    const time = document.getElementById('delivery-time').value.trim();
    const comment = document.getElementById('customer-comment').value.trim();
    
    // Валидация обязательных полей
    if (!name || !phone || !address) {
        showNotification('Пожалуйста, заполните имя, телефон и адрес');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const itemsText = cart.map(item => 
        `${item.name} (${item.quantity || 1} шт.) - ${item.price * (item.quantity || 1)} ₽`
    ).join('%0A');
    
    // Формируем сообщение для Telegram
    const message = `
<b>🍕 Новый заказ!</b>
%0A%0A
<b>👤 Контактные данные:</b>
%0A├ Имя: ${name}
%0A└ Телефон: ${phone}
%0A%0A
<b>🚚 Доставка:</b>
%0A├ Адрес: ${address}
%0A└ Время: ${time || 'Как можно скорее'}
%0A%0A
<b>📦 Состав заказа:</b>
%0A${itemsText}
%0A%0A
<b>💵 Итого:</b> ${total} ₽
%0A%0A
<b>📝 Комментарий:</b>
%0A${comment || 'Нет комментариев'}
    `.trim();
    
    const botToken = '8195704085:AAHMBHP0g906T86Q0w0gW7cMsCvpFq-yw1g";
  const chatId = "7699424458";

  fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  }).then(response => {
    if (response.ok) {
      alert("Заказ отправлен! Мы свяжемся с вами в Telegram 📲");
    } else {
      alert("Ошибка при отправке заказа.");
    }
  });
});

