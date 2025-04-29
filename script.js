let cart = [];

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const total = document.getElementById("total");

  list.innerHTML = "";
  let sum = 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} — ${item.price} ₽`;
    list.appendChild(li);
    sum += item.price;
  });

  total.textContent = `Итого: ${sum} ₽`;
}

function clearCart() {
  cart = [];
  renderCart();
}