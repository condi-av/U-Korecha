// Тема сайта
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Бургер-меню (можно улучшить позже)
document.querySelector(".burger").addEventListener("click", () => {
  const menu = document.querySelector(".menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});