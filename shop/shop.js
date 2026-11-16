const shopGrid = document.getElementById("prints");

window.Store.products.forEach((product) => {
  console.log9(product);
  const card = document.createElement("article");
  card.className = "product";
  card.dataset.category = product.category;

  const imageLink = document.createElement("a");
  imageLink.className = "product-image";
  imageLink.href = `../product/index.html?product=${encodeURIComponent(product.id)}`;
  imageLink.setAttribute("aria-label", `View ${product.name}`);

  const image = document.createElement("img");
  image.className = "product-artwork";
  image.src = product.image;
  image.alt = product.imageAlt;
  imageLink.append(image);

  const productInfo = document.createElement("div");
  productInfo.className = "product-info";
  const details = document.createElement("div");
  const name = document.createElement("a");
  name.className = "product-name";
  name.href = imageLink.href;
  name.textContent = product.name;
  const description = document.createElement("div");
  description.className = "product-meta";
  description.textContent = product.description;
  details.append(name, description);

  const price = document.createElement("div");
  price.className = "price";
  price.textContent = product.priceLabel;
  productInfo.append(details, price);
  card.append(imageLink, productInfo);
  shopGrid.append(card);
});
