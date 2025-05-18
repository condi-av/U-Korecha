document.addEventListener('DOMContentLoaded', function() {
    // Инициализация переменных
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-price');
    const cartSidebar = document.getElementById('cart-sidebar');
    const notification = document.getElementById('notification');
    const orderModal = document.getElementById('order-modal');
    const orderForm = document.getElementById('order-form');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Управление темой
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    function toggleTheme() {
        if (body.getAttribute('data-theme') === 'light') {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Работа с корзиной
    function addToCart(product) {
        const existingItem = cart.find(item => 
            item.id === product.id && 
            item.price === product.price &&
            (item.size === product.size || (!item.size && !product.size))
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }

        updateCartUI();
        showNotification(`${product.name} добавлен в корзину`);
    }

    function updateCartUI() {
        cartItems.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-header">
                        <span class="cart-item-title">${item.name}${item.size ? ` (${item.size} см)` : ''}</span>
                        <span class="cart-item-price">${(item.price * item.quantity).toFixed(2)}₽</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" data-index="${index}" data-change="-1">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-change="1">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });
        }
        
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartTotal.textContent = total.toFixed(2);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Обработчики событий
    function setupEventListeners() {
        // Кнопка темы
        themeToggle.addEventListener('click', toggleTheme);
        
        // Добавление в корзину
        document.addEventListener('click', function(e) {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const productCard = button.closest('.product-card');
                const activeSize = productCard.querySelector('.size-btn.active');
                
                const product = {
                    id: button.getAttribute('data-id'),
                    name: button.getAttribute('data-name'),
                    price: parseFloat(button.getAttribute('data-price')),
                    size: activeSize ? activeSize.getAttribute('data-size') : null
                };
                addToCart(product);
            }

            // Выбор размера
            if (e.target.closest('.size-btn')) {
                const button = e.target.closest('.size-btn');
                const productCard = button.closest('.product-card');
                
                productCard.querySelectorAll('.size-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                const addButton = productCard.querySelector('.add-to-cart');
                addButton.setAttribute('data-price', button.getAttribute('data-price'));
            }

            // Управление корзиной
            if (e.target.closest('.quantity-btn, .remove-btn')) {
                const button = e.target.closest('[data-index]');
                const index = parseInt(button.getAttribute('data-index'));
                
                if (button.classList.contains('remove-btn')) {
                    const removedItem = cart.splice(index, 1)[0];
                    showNotification(`${removedItem.name} удален из корзины`);
                } else {
                    const change = parseInt(button.getAttribute('data-change'));
                    cart[index].quantity += change;
                    
                    if (cart[index].quantity < 1) {
                        const removedItem = cart.splice(index, 1)[0];
                        showNotification(`${removedItem.name} удален из корзины`);
                    }
                }
                updateCartUI();
            }
        });

        // Форма заказа
        orderForm.addEventListener('submit', submitOrder);
    }

    // Оформление заказа
    async function submitOrder(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const comment = document.getElementById('comment').value;
        
        let message = `🍕 *Новый заказ | Пицца у Кореша* 🍕\n\n`;
        message += `👤 *Имя:* ${name}\n`;
        message += `📞 *Телефон:* ${phone}\n`;
        message += `📍 *Адрес:* ${address}\n\n`;
        message += `🛒 *Заказ:*\n`;
        
        cart.forEach(item => {
            message += `- ${item.name}${item.size ? ` (${item.size} см)` : ''} ` +
                       `(${item.quantity} x ${item.price}₽) = ${item.quantity * item.price}₽\n`;
        });
        
        message += `\n💰 *Итого:* ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}₽\n`;
        message += `📝 *Комментарий:* ${comment || 'нет'}\n\n`;
        message += `⏱ ${new Date().toLocaleString('ru-RU')}`;

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;

            // Здесь код отправки в Telegram (оставьте ваш существующий)
            
            showNotification('✅ Заказ успешно отправлен!');
            cart = [];
            updateCartUI();
            orderForm.reset();
            closeModal();
        } catch (error) {
            showNotification(`❌ Ошибка: ${error.message}`, 'error');
        }
    }

    // Вспомогательные функции
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    // Глобальные функции
    window.toggleCart = function() {
        cartSidebar.classList.toggle('active');
    };

    window.checkout = function() {
        if (cart.length === 0) {
            showNotification('Корзина пуста!', 'error');
            return;
        }
        orderModal.style.display = 'block';
    };

    window.closeModal = function() {
        orderModal.style.display = 'none';
    };

    // Инициализация
    function init() {
        initTheme();
        updateCartUI();
        setupEventListeners();
    }

    init();
});
