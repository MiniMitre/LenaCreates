(() => {
  const products = [
    {
      id: "centrepiece",
      name: "Centrepiece",
      description: "A5 Centrepiece artwork",
      category: "small",
      image: "../images/centrepiece.jpg",
      imageAlt: "Floral paper collage artwork",
      priceMinor: 500,
      priceLabel: "£5",
      available: true,
    },
    {
      id: "jellyfish",
      name: "Jellyfish",
      description: "A4 Jellyfish artwork",
      category: "A4",
      image: "../images/jellyfish.png",
      imageAlt: "Jellyfish paper collage artwork",
      priceMinor: 1000,
      priceLabel: "£10",
      available: true,
    },
    {
      id: "Daffodils",
      name: "Daffodils",
      description: "A6 print",
      category: "small",
      image: "../images/Daffodils.png",
      imageAlt: "Floral paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "Landscape",
      name: "Landscape",
      description: "A5 Landscape artwork",
      category: "small",
      image: "../images/Landscape.png",
      imageAlt: "Landscape paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "Matt_Lena",
      name: "Matt & Lena",
      description: "Matt & Lena Greetings Card",
      category: "card",
      image: "../images/Matt_Lena.png",
      imageAlt: "Matt & Lena paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "River",
      name: "River",
      description: "A4 River artwork",
      category: "A4",
      image: "../images/River.png",
      imageAlt: "River paper collage artwork",
      priceMinor: null,
      priceLabel: "Coming soon",
      available: false,
    },
    {
      id: "Trees",
      name: "Trees",
      description: "A4 Trees artwork",
      category: "A4",
      image: "../images/Trees.png",
      imageAlt: "Trees paper collage artwork",
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
