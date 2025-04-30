// Обновленный код для выбора размера
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const parent = this.closest('.product-info');
        parent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const price = this.getAttribute('data-price');
        const addButton = this.closest('.product-card').querySelector('.add-to-cart');
        addButton.setAttribute('data-price', price);
    });
});

// Модифицированная функция добавления в корзину
function addToCart(id, name, price) {
    const size = document.querySelector(`[data-id="${id}"]`).closest('.product-card')
        .querySelector('.size-btn.active').getAttribute('data-size');
    
    const existingItem = cart.find(item => item.id === id && item.size === size);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id,
            name: `${name} (${size} см)`,
            price: parseInt(price),
            quantity: 1,
            size
        });
    }
    
    updateCart();
}

// Остальной код без изменений
// ...