const filters = document.querySelectorAll(".filter");
filters.forEach((button) =>
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".product").forEach((product) => {
      product.classList.toggle(
        "hidden",
        button.dataset.filter !== "all" &&
          product.dataset.category !== button.dataset.filter
      );
    });
  })
);

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount || !window.Store) return;
  try {
    cartCount.textContent = String(window.Store.itemCount());
  } catch (error) {
    console.error("Could not update the basket count.", error);
  }
}

updateCartCount();
window.addEventListener("cartchange", updateCartCount);

const signup = document.getElementById("signup");
const toast = document.getElementById("toast");
if (signup && toast) {
  signup.addEventListener("submit", (event) => {
    event.preventDefault();
    toast.textContent = "Newsletter signup confirmation message goes here.";
    toast.classList.add("show");
    event.target.reset();
    setTimeout(() => toast.classList.remove("show"), 3000);
  });
}
