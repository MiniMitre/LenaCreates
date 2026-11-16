const CHECKOUT_API_URL =
  "https://lenacreates-checkout.lenacreates0.workers.dev/api/checkout";
const checkoutStatus = document.getElementById("checkout-status");
const cartItems = document.getElementById("cart-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const checkoutButton = document.getElementById("checkout-button");

function renderCart() {
  cartItems.replaceChildren();
  checkoutButton.disabled = true;

  try {
    const items = window.Store.readCart();
    if (!items.length) {
      checkoutStatus.textContent = "Your basket is empty.";
      cartSubtotal.textContent = window.Store.formatPrice(0);
      return;
    }

    checkoutStatus.textContent = "";
    let subtotal = 0;
    items.forEach((item) => {
      const product = window.Store.getProduct(item.productId);
      if (!product) return;

      subtotal += product.priceMinor * item.quantity;
      const row = document.createElement("article");
      row.className = "cart-item";

      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.imageAlt;

      const details = document.createElement("div");
      details.className = "cart-item-details";
      const name = document.createElement("h2");
      name.textContent = product.name;
      const price = document.createElement("p");
      price.textContent = `${window.Store.formatPrice(product.priceMinor)} each`;
      details.append(name, price);

      const quantity = document.createElement("div");
      quantity.className = "cart-quantity";
      const decrease = document.createElement("button");
      decrease.type = "button";
      decrease.textContent = "−";
      decrease.setAttribute("aria-label", `Remove one ${product.name}`);
      decrease.addEventListener("click", () =>
        window.Store.updateQuantity(item.productId, item.quantity - 1)
      );
      const quantityText = document.createElement("span");
      quantityText.textContent = String(item.quantity);
      const increase = document.createElement("button");
      increase.type = "button";
      increase.textContent = "+";
      increase.setAttribute("aria-label", `Add one ${product.name}`);
      increase.addEventListener("click", () =>
        window.Store.updateQuantity(item.productId, item.quantity + 1)
      );
      quantity.append(decrease, quantityText, increase);
      row.append(image, details, quantity);
      cartItems.append(row);
    });

    cartSubtotal.textContent = window.Store.formatPrice(subtotal);
    checkoutButton.disabled = false;
  } catch (error) {
    console.error("Could not read the shopping basket.", error);
    checkoutStatus.textContent =
      error instanceof Error ? error.message : "Could not read your basket.";
  }
}

async function startCheckout() {
  const items = window.Store.readCart();
  if (!items.length) {
    renderCart();
    return;
  }

  checkoutButton.disabled = true;
  checkoutButton.textContent = "Connecting to secure checkout…";
  checkoutStatus.textContent = "Connecting to Stripe…";

  try {
    const response = await fetch(CHECKOUT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("The checkout service returned an invalid response.");
    }

    if (!response.ok || !data || typeof data.url !== "string") {
      throw new Error(
        (data && typeof data.error === "string" && data.error) ||
          "Could not start checkout. Please try again."
      );
    }

    const checkoutUrl = new URL(data.url);
    if (
      checkoutUrl.protocol !== "https:" ||
      checkoutUrl.hostname !== "checkout.stripe.com"
    ) {
      throw new Error("The checkout service returned an invalid payment URL.");
    }

    checkoutStatus.textContent = "Redirecting to Stripe…";
    window.location.href = checkoutUrl.href;
  } catch (error) {
    console.error("Could not start Stripe Checkout.", error);
    checkoutStatus.textContent =
      error instanceof Error
        ? `Checkout couldn't be started: ${error.message}`
        : "Network error starting checkout. Please try again.";
    checkoutButton.disabled = false;
    checkoutButton.textContent = "Continue to Stripe Checkout";
  }
}

checkoutButton.addEventListener("click", startCheckout);
window.addEventListener("cartchange", renderCart);
renderCart();
