document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // Инициализация переменных
    // ======================
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-price');
    const cartSidebar = document.getElementById('cart-sidebar');
    const notification = document.getElementById('notification');
    const orderModal = document.getElementById('order-modal');
    const orderForm = document.getElementById('order-form');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // ======================
    // Управление темой
    // ======================
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.setAttribute('data-theme', 'light');
            themeIcon.src = 'icons/sun.svg';
        } else {
            body.removeAttribute('data-theme');
            themeIcon.src = 'icons/moon.svg';
        }
    }

    function toggleTheme() {
        if (body.getAttribute('data-theme') === 'light') {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            themeIcon.src = 'icons/moon.svg';
        } else {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeIcon.src = 'icons/sun.svg';
        }
    }

    // ======================
    // Работа с корзиной
    // ======================
    function addToCart(product) {
        const existingItem = cart.find(item => 
            item.id === product.id && 
            item.price === product.price &&
            item.size === product.size
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(product);
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
                            <img src="icons/minus.svg" alt="Уменьшить" class="icon">
                        </button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-change="1">
                            <img src="icons/plus.svg" alt="Увеличить" class="icon">
                        </button>
                        <button class="remove-btn" data-index="${index}">
                            <img src="icons/trash.svg" alt="Удалить" class="icon">
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

    // ======================
    // Обработчики событий
    // ======================
    function setupProductHandlers() {
        // Добавление в корзину
        productList.addEventListener('click', function(e) {
            const addButton = e.target.closest('.add-to-cart');
            if (addButton) {
                const productCard = addButton.closest('.product-card');
                const activeSize = productCard.querySelector('.size-btn.active');
                
                const product = {
                    id: addButton.getAttribute('data-id'),
                    name: addButton.getAttribute('data-name'),
                    price: parseFloat(addButton.getAttribute('data-price')),
                    size: activeSize ? activeSize.getAttribute('data-size') : null,
                    quantity: 1
                };
                addToCart(product);
            }

            // Выбор размера пиццы
            const sizeButton = e.target.closest('.size-btn');
            if (sizeButton) {
                const productCard = sizeButton.closest('.product-card');
                const addButton = productCard.querySelector('.add-to-cart');
                const newPrice = sizeButton.getAttribute('data-price');
                
                addButton.setAttribute('data-price', newPrice);
                
                productCard.querySelectorAll('.size-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                sizeButton.classList.add('active');
            }
        });

        // Управление корзиной
        cartItems.addEventListener('click', function(e) {
            const target = e.target.closest('[data-index]');
            if (!target) return;

            const index = parseInt(target.getAttribute('data-index'));
            
            if (target.classList.contains('remove-btn')) {
                const removedItem = cart.splice(index, 1)[0];
                showNotification(`${removedItem.name} удален из корзины`);
                updateCartUI();
            } 
            else if (target.classList.contains('quantity-btn')) {
                const change = parseInt(target.getAttribute('data-change'));
                const newQuantity = cart[index].quantity + change;
                
                if (newQuantity < 1) {
                    const removedItem = cart.splice(index, 1)[0];
                    showNotification(`${removedItem.name} удален из корзины`);
                } else {
                    cart[index].quantity = newQuantity;
                }
                updateCartUI();
            }
        });
    }

    // ======================
    // Оформление заказа
    // ======================
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
            const botToken = '8195704085:AAHMBHP0g906T86Q0w0gW7cMsCvpFq-yw1g';
            const chatId = '5414933430';
            
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<img src="icons/spinner.svg" alt="Отправка" class="icon spin"> Отправка...';
            submitBtn.disabled = true;

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            if (!response.ok) throw new Error('Ошибка сервера');

            showNotification('✅ Заказ успешно отправлен!');
            closeModal();
            
            // Очистка корзины
            cart = [];
            updateCartUI();
            orderForm.reset();

        } catch (error) {
            console.error('Ошибка:', error);
            showNotification(`❌ Ошибка: ${error.message}`, 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<img src="icons/send.svg" alt="Отправить" class="icon"> Отправить заказ';
                submitBtn.disabled = false;
            }
        }
    }

    // ======================
    // Вспомогательные функции
    // ======================
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    // ======================
    // Глобальные функции
    // ======================
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

    // ======================
    // Инициализация
    // ======================
    function init() {
        initTheme();
        updateCartUI();
        setupProductHandlers();
        
        themeToggle.addEventListener('click', toggleTheme);
        orderForm.addEventListener('submit', submitOrder);
        
        // Закрытие корзины при клике вне её
        document.addEventListener('click', function(e) {
            if (!cartSidebar.contains(e.target) && 
                !e.target.closest('.cart-btn') && 
                cartSidebar.classList.contains('active')) {
                toggleCart();
            }
            
            // Закрытие модального окна
            if (e.target === orderModal) {
                closeModal();
            }
        });

        // Плавающая форма на мобильных устройствах
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (window.innerWidth < 768) {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    init();
});
