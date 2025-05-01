document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-price');
    const cartSidebar = document.getElementById('cart-sidebar');
    const notification = document.getElementById('notification');
    const orderModal = document.getElementById('order-modal');
    
    // Загрузка корзины из localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Обновление UI корзины
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

    // Добавление в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const id = this.getAttribute('data-id');
            
            const existingItem = cart.find(item => item.id === id && item.price === price);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }
            
            updateCartUI();
            showNotification(`${name} добавлен в корзину`);
        });
    });

    // Изменение количества
    window.changeQuantity = function(index, change) {
        const newQuantity = cart[index].quantity + change;
        
        if (newQuantity < 1) {
            removeFromCart(index);
            return;
        }
        
        cart[index].quantity = newQuantity;
        updateCartUI();
    };

    // Удаление из корзины
    window.removeFromCart = function(index) {
        const removedItem = cart.splice(index, 1)[0];
        showNotification(`${removedItem.name} удален из корзины`);
        updateCartUI();
    };

    // Переключение корзины
    window.toggleCart = function() {
        cartSidebar.classList.toggle('active');
    };

    // Оформление заказа
    window.checkout = function() {
        if (cart.length === 0) {
            showNotification('Корзина пуста!', 'error');
            return;
        }
        orderModal.style.display = 'block';
    };

    // Закрытие модального окна
    window.closeModal = function() {
        orderModal.style.display = 'none';
    };

    // Отправка заказа в Telegram
    window.submitOrder = async function(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const comment = document.getElementById('comment').value;
        
        // Формируем сообщение
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
            
            // Показываем индикатор загрузки
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;

            // Отправка в Telegram
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.description || 'Ошибка сервера');
            }

            showNotification('✅ Заказ успешно отправлен!');
            closeModal();
            
            // Очистка корзины
            cart = [];
            updateCartUI();
            event.target.reset();

        } catch (error) {
            console.error('Ошибка:', error);
            showNotification(`❌ Ошибка: ${error.message}`, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    };

    // Уведомления
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification';
        notification.style.backgroundColor = type === 'error' ? 'var(--danger)' : 'var(--success)';
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    // Обработка размеров пиццы
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

    // Переключение темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const themeIcon = this.querySelector('i');
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeIcon.classList.replace('fa-sun', 'fa-moon');
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }

    // Применение сохраненной темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeToggle) {
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    // Закрытие корзины при клике вне ее области
    document.addEventListener('click', function(event) {
        if (!cartSidebar.contains(event.target) && 
            !event.target.closest('.cart-btn') && 
            cartSidebar.classList.contains('active')) {
            toggleCart();
        }
    });

    // Инициализация
    updateCartUI();
});
