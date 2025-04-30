document.addEventListener('DOMContentLoaded', function() {
    let cart = [];
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-price');
    const notification = document.getElementById('notification');
    const cartSidebar = document.getElementById('cart-sidebar');

    // Переключение категорий
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

    // Добавление в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            
            addToCart(id, name, price);
            showNotification(`${name} добавлен в корзину`);
        });
    });

    // Функция добавления в корзину
    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id,
                name,
                price,
                quantity: 1
            });
        }
        
        updateCart();
    }

    // Обновление корзины
    function updateCart() {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
            cartCount.textContent = '0';
            cartTotal.textContent = '0 ₽';
            return;
        }
        
        let total = 0;
        let count = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            count += item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-header">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-price">${itemTotal} ₽</span>
                </div>
                <div class="cart-item-controls">
                    <button onclick="changeQuantity('${item.id}', -1)">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1)">+</button>
                    <button onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        cartCount.textContent = count;
        cartTotal.textContent = `${total} ₽`;
    }

    // Изменение количества
    window.changeQuantity = function(id, delta) {
        const item = cart.find(item => item.id === id);
        if (!item) return;
        
        item.quantity += delta;
        
        if (item.quantity < 1) {
            removeFromCart(id);
            return;
        }
        
        updateCart();
    };

    // Удаление из корзины
    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        updateCart();
        showNotification('Товар удален из корзины');
    };

    // Показать/скрыть корзину
    window.toggleCart = function() {
        cartSidebar.classList.toggle('active');
    };

    // Оформление заказа
    window.checkout = function() {
        if (cart.length === 0) {
            showNotification('Корзина пуста');
            return;
        }
        
        let message = 'Новый заказ:\n\n';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `${item.name} - ${item.quantity} × ${item.price} ₽ = ${itemTotal} ₽\n`;
        });
        
        message += `\nИтого: ${total} ₽`;
        
        // В реальном проекте здесь будет отправка на сервер
        console.log(message);
        showNotification('Заказ оформлен! С вами свяжутся для подтверждения');
        cart = [];
        updateCart();
        toggleCart();
    };

    // Показать уведомление
    function showNotification(text) {
        notification.textContent = text;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
