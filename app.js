let cart = [];

document.addEventListener('DOMContentLoaded', function() {
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

    // Обработка выбора размера пиццы
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.closest('.product-info');
            if (parent) {
                parent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const price = this.getAttribute('data-price');
                const addButton = this.closest('.product-card').querySelector('.add-to-cart');
                addButton.setAttribute('data-price', price);
            }
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

    // Функция добавления в корзину (исправленная)
    function addToCart(id, name, price) {
        const productCard = document.querySelector(`[data-id="${id}"]`).closest('.product-card');
        const sizeBtn = productCard.querySelector('.size-btn.active');
        
        // Для напитков size будет null
        const size = sizeBtn ? sizeBtn.getAttribute('data-size') : null;
        const displayName = size ? `${name} (${size} см)` : name;
        
        // Поиск существующего товара (учитываем наличие размера)
        const existingItem = cart.find(item => 
            item.id === id && 
            ((size && item.size === size) || (!size && !item.size))
        );
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id,
                name: displayName,
                price: parseInt(price),
                quantity: 1,
                size: size || null
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
                    <button onclick="changeQuantity('${item.id}', -1, '${item.size || ''}')">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.id}', 1, '${item.size || ''}')">+</button>
                    <button onclick="removeFromCart('${item.id}', '${item.size || ''}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(cartItem);
        });
        
        cartCount.textContent = count;
        cartTotal.textContent = `${total} ₽`;
    }

    // Глобальные функции
    window.changeQuantity = function(id, delta, size) {
        // Для напитков size будет пустой строкой, преобразуем в null
        const itemSize = size === '' ? null : size;
        
        const item = cart.find(item => 
            item.id === id && 
            ((itemSize !== null && item.size === itemSize) || (itemSize === null && item.size === null))
        );
        
        if (!item) return;
        
        item.quantity += delta;
        
        if (item.quantity < 1) {
            removeFromCart(id, itemSize);
            return;
        }
        
        updateCart();
    };

    window.removeFromCart = function(id, size) {
        // Для напитков size будет пустой строкой, преобразуем в null
        const itemSize = size === '' ? null : size;
        
        cart = cart.filter(item => 
            !(item.id === id && 
            ((itemSize !== null && item.size === itemSize) || (itemSize === null && item.size === null))
        );
        updateCart();
        showNotification('Товар удален из корзины');
    };

    window.toggleCart = function() {
        cartSidebar.classList.toggle('active');
    };

    window.checkout = function() {
        if (cart.length === 0) {
            showNotification('Корзина пуста');
            return;
        }
        document.getElementById('order-modal').style.display = 'block';
    };

    window.closeModal = function() {
        document.getElementById('order-modal').style.display = 'none';
    };

    window.submitOrder = function(event) {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        const comment = document.getElementById('comment').value;
        
        let message = `📦 *Новый заказ!*\n\n`;
        message += `👤 *ФИО:* ${name}\n`;
        message += `📱 *Телефон:* ${phone}\n`;
        message += `🏠 *Адрес:* ${address}\n`;
        message += `💬 *Комментарий:* ${comment || '—'}\n\n`;
        message += `🍕 *Заказ:*\n`;
        
        cart.forEach(item => {
            message += `- ${item.name} (${item.quantity} × ${item.price} ₽) = ${item.quantity * item.price} ₽\n`;
        });
        
        message += `\n*Итого:* ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽`;

        const token = '8195704085:AAHMBHP0g906T86Q0w0gW7cMsCvpFq-yw1g';
        const chatId = '5414933430';
        
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        })
        .then(response => {
            if (response.ok) {
                showNotification('Заказ успешно отправлен!');
                cart = [];
                updateCart();
                closeModal();
                toggleCart();
            } else {
                showNotification('Ошибка отправки заказа');
            }
        })
        .catch(() => showNotification('Ошибка соединения'));
    };

    // Уведомления
    function showNotification(text) {
        notification.textContent = text;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Переключение темы (исправленное)
    document.getElementById('theme-toggle').addEventListener('click', function() {
        const body = document.body;
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

    // Проверка сохраненной темы при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
});
