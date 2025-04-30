let cart = [];
let currentTheme = localStorage.getItem('theme') || 'light';

const products = {
    pizza: [
        {id: 1, name: 'Маргарита', price: 450, image: 'pizza1.jpg'},
        {id: 2, name: 'Пепперони', price: 550, image: 'pizza2.jpg'},
    ],
    drinks: [
        {id: 3, name: 'Кола', price: 120, image: 'cola.jpg'},
        {id: 4, name: 'Лимонад', price: 100, image: 'lemonade.jpg'},
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-theme', currentTheme);
    renderProducts('pizza');
    
    document.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', () => {
            renderProducts(button.dataset.category);
        });
    });
});

function renderProducts(category) {
    const container = document.getElementById('product-list');
    container.innerHTML = products[category].map(product => `
        <div class="product-card">
            <img src="${product.image}" class="product-image" alt="${product.name}">
            <div>
                <h3>${product.name}</h3>
                <p>${product.price} ₽</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">В корзину</button>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const product = [...products.pizza, ...products.drinks].find(p => p.id === productId);
    cart.push(product);
    updateCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

function updateCart() {
    document.getElementById('cart-count').textContent = cart.length;
    document.getElementById('cart-items').innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} - ${item.price} ₽</span>
            <button onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
}

async function checkout() {
    if(cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const message = `Новый заказ:%0A${cart.map(item => `- ${item.name} (${item.price} ₽)`).join('%0A')}%0A%0AИтого: ${total} ₽`;
    
    // Замените YOUR_BOT_TOKEN и YOUR_CHAT_ID на реальные значения
    await fetch(`https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage?chat_id=YOUR_CHAT_ID&text=${message}`);
    
    alert('Заказ оформлен! С вами свяжутся в Telegram');
    cart = [];
    updateCart();
    toggleCart();
}