
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total-price');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = [];

    // Обновление UI корзины
    function updateCartUI() {
        cartItems.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price;
            const li = document.createElement('li');
            li.textContent = item.name + " - " + item.price + "₽";
            cartItems.appendChild(li);
        });
        cartCount.textContent = cart.length;
        cartTotal.textContent = total.toFixed(2);
    }

    // Добавление в корзину
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const id = this.getAttribute('data-id');
            cart.push({ id, name, price });
            updateCartUI();
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

    // Применение темы при загрузке
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
    } else {
        body.removeAttribute('data-theme');
    }
});
