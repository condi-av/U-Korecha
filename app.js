document.addEventListener('DOMContentLoaded', function() {
    // ======================
    //  Инициализация
    // ======================
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-price');
    const cartSidebar = document.getElementById('cart-sidebar');
    const notification = document.getElementById('notification');
    const orderModal = document.getElementById('order-modal');
    const orderForm = document.getElementById('order-form');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // ======================
    //  Управление темой
    // ======================
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

    // ======================
    //  Корзина
    // ======================
    function updateCartUI() {
        cartItems.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.innerHTML = `
                    <div class="cart-item-header">
                        <span class="cart-item-title">${item.name}</span>
                        <span class="cart-item-price">${(item.price * item.quantity).toFixed(2)}₽</span>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="changeQuantity(${index}, -1)"><i class="fas fa-minus"></i></button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)"><i class="fas fa-plus"></i></button>
                        <button onclick="removeFromCart(${index})" class="remove-btn"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                cartItems.appendChild(li);
            });
        }
        
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartTotal.textContent = total.toFixed(2);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // ======================
    //  Товары и категории
    // ======================
    function setupCategoryFilters() {
        document.querySelectorAll('.menu-category button').forEach(button => {
            button.addEventListener('click', function() {
                document.querySelectorAll('.menu-category button').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                document.querySelectorAll('.product-card').forEach(card => {
                    card.style.display = card.getAttribute('data-category') === category ? 'block' : 'none';
                });
            });
        });
    }

    function setupSizeSelectors() {
        document.querySelectorAll('.size-btn').forEach(button => {
            button.addEventListener('click', function() {
                const parent = this.closest('.product-card');
                const addButton = parent.querySelector('.add-to-cart');
                const price = parseFloat(this.getAttribute('data-price'));
                
                addButton.setAttribute('data-price', price);
                
                parent.querySelectorAll('.size-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                this.classList.add('active');
            });
        });
    }

    // ======================
    //  Оформление заказа
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
            message += `- ${item.name} (${item.quantity} x ${item.price}₽) = ${item.quantity * item.price}₽\n`;
        });
        
        message += `\n💰 *Итого:* ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}₽\n`;
        message += `📝 *Комментарий:* ${comment || 'нет'}\n\n`;
        message += `⏱ ${new Date().toLocaleString('ru-RU')}`;

        try {
            const botToken = '8195704085:AAHMBHP0g906T86Q0w0gW7cMsCvpFq-yw1g';
            const chatId = '5414933430';
            
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
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
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить заказ';
                submitBtn.disabled = false;
            }
        }
    }

    // ======================
    //  Вспомогательные функции
    // ======================
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification';
        notification.style.backgroundColor = type === 'error' ? 'var(--danger)' : 'var(--success)';
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    // ======================
    //  Глобальные функции
    // ======================
    window.changeQuantity = function(index, change) {
        const newQuantity = cart[index].quantity + change;
        if (newQuantity < 1) {
            removeFromCart(index);
            return;
        }
        cart[index].quantity = newQuantity;
        updateCartUI();
    };

    window.removeFromCart = function(index) {
        const removedItem = cart.splice(index, 1)[0];
        showNotification(`${removedItem.name} удален из корзины`);
        updateCartUI();
    };

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

    window.submitOrder = submitOrder;

    // ======================
    //  Инициализация
    // ======================
    function init() {
        initTheme();
        updateCartUI();
        setupCategoryFilters();
        setupSizeSelectors();
        
        themeToggle.addEventListener('click', toggleTheme);
        orderForm.addEventListener('submit', submitOrder);
        
        // Закрытие корзины при клике вне её
        document.addEventListener('click', function(event) {
            if (!cartSidebar.contains(event.target) && 
                !event.target.closest('.cart-btn') && 
                cartSidebar.classList.contains('active')) {
                toggleCart();
            }
        });
    }

    init();
});
