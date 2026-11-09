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

      const cartButton = document.getElementById("cart-btn");
      const setCartVisibility = () => {
        if (!cartButton) return;
        const path = window.location.pathname.replace(/\\/g, "/");
        const isShopPage = /(?:^|\/)shop(?:\/index\.html)?\/?$/.test(path);
        cartButton.classList.toggle("hidden", !isShopPage);
      };

      window.addEventListener("hashchange", setCartVisibility);
      setCartVisibility();

      let count = 0;
      const toast = document.getElementById("toast");
      if (cartButton && toast) {
        cartButton.addEventListener("click", () => {
          toast.textContent = count
            ? `${count} item${count === 1 ? "" : "s"} in your bag`
            : "Your bag is empty.";
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 2400);
        });
      }
      document.querySelectorAll(".product").forEach((product) =>
        product.addEventListener("click", () => {
          if (product.querySelector(".product-checkout") || !toast) return;
          count++;
          const cartCount = document.getElementById("cart-count");
          if (cartCount) cartCount.textContent = count;
          toast.textContent = `${product.querySelector(".product-name").textContent} added to your bag`;
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 2400);
        })
      );
      const signup = document.getElementById("signup");
      if (signup && toast) {
        signup.addEventListener("submit", (event) => {
          event.preventDefault();
          toast.textContent =
            "Newsletter signup confirmation message goes here.";
          toast.classList.add("show");
          event.target.reset();
          setTimeout(() => toast.classList.remove("show"), 3000);
        });
      }
