(() => {
  const products = [
    {
      id: "centrepiece",
      name: "Centrepiece",
      description: "Centrepiece artwork",
      category: "small",
      image: "../images/image.jpg",
      imageAlt: "Floral paper collage artwork",
      priceMinor: 500,
      priceLabel: "£5",
      available: true,
    },
    {
      id: "jellyfish-small",
      name: "Jellyfish print",
      description: "A5 & A6 prints",
      category: "small",
      image: "../images/IMG_9301.JPG",
      imageAlt: "Jellyfish paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "centrepiece-a4",
      name: "Centrepiece print",
      description: "A4 print",
      category: "a4",
      image: "../images/image.jpg",
      imageAlt: "Floral paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "jellyfish-a4",
      name: "Jellyfish print",
      description: "A4 print",
      category: "a4",
      image: "../images/IMG_9301.JPG",
      imageAlt: "Jellyfish paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "centrepiece-card",
      name: "Centrepiece card",
      description: "Greetings card",
      category: "cards",
      image: "../images/image.jpg",
      imageAlt: "Floral paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "jellyfish-card",
      name: "Jellyfish card",
      description: "Greetings card",
      category: "cards",
      image: "../images/IMG_9301.JPG",
      imageAlt: "Jellyfish paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "centrepiece-small",
      name: "Centrepiece print",
      description: "A5 & A6 prints",
      category: "small",
      image: "../images/image.jpg",
      imageAlt: "Floral paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "jellyfish-a4-large",
      name: "Jellyfish print",
      description: "A4 print",
      category: "a4",
      image: "../images/IMG_9301.JPG",
      imageAlt: "Jellyfish paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
  ];
  const productById = new Map(products.map((product) => [product.id, product]));
  const cartKey = "lenacreates-cart";

  function readCart() {
    const saved = localStorage.getItem(cartKey);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error(
        "Your saved basket has an invalid format. Clear it to continue."
      );
    }

    const quantities = new Map();
    parsed.forEach((item) => {
      if (
        item &&
        productById.has(item.productId) &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        productById.get(item.productId).available
      ) {
        quantities.set(
          item.productId,
          (quantities.get(item.productId) || 0) + item.quantity
        );
      }
    });

    return Array.from(quantities, ([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  function saveCart(items) {
    localStorage.setItem(cartKey, JSON.stringify(items));
    window.dispatchEvent(new Event("cartchange"));
  }

  function addToCart(productId) {
    const product = productById.get(productId);
    if (!product || !product.available) {
      throw new Error("This product is not available to purchase yet.");
    }
    const items = readCart();
    const item = items.find((entry) => entry.productId === productId);
    if (item) {
      if (item.quantity >= 99) throw new Error("The maximum quantity is 99.");
      item.quantity += 1;
    } else {
      items.push({ productId, quantity: 1 });
    }
    saveCart(items);
  }

  function updateQuantity(productId, quantity) {
    const items = readCart();
    const item = items.find((entry) => entry.productId === productId);
    if (!item) return;
    if (quantity <= 0) {
      saveCart(items.filter((entry) => entry.productId !== productId));
      return;
    }
    if (!Number.isSafeInteger(quantity) || quantity > 99) {
      throw new Error("Choose a quantity between 1 and 99.");
    }
    item.quantity = quantity;
    saveCart(items);
  }

  window.Store = {
    products,
    getProduct: (productId) => productById.get(productId),
    readCart,
    addToCart,
    updateQuantity,
    itemCount: () =>
      readCart().reduce((total, item) => total + item.quantity, 0),
    formatPrice: (amount) =>
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(amount / 100),
  };
})();
