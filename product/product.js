const productId = new URLSearchParams(window.location.search).get("product");
const product = productId && window.Store.getProduct(productId);
const productStatus = document.getElementById("product-status");
const productDetail = document.getElementById("product-detail");

if (!product) {
  productStatus.textContent = "This print could not be found.";
} else {
  document.title = `${product.name} | LenaCreates.art`;
  productDetail.classList.remove("hidden");
  document.getElementById("product-image").src = product.image;
  document.getElementById("product-image").alt = product.imageAlt;
  document.getElementById("product-description").textContent =
    product.description;
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-price").textContent = product.priceLabel;

  const addButton = document.getElementById("add-to-cart");
  const availability = document.getElementById("product-availability");
  if (!product.available) {
    availability.textContent = "This print will be available soon.";
    addButton.disabled = true;
    addButton.textContent = "Coming soon";
  } else {
    availability.textContent = "Available to order.";
    addButton.addEventListener("click", () => {
      try {
        window.Store.addToCart(product.id);
        productStatus.textContent = `${product.name} added to your basket.`;
      } catch (error) {
        productStatus.textContent =
          error instanceof Error
            ? error.message
            : "Could not update your basket.";
      }
    });
  }
}
