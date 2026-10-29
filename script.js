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
      let count = 0;
      const toast = document.getElementById("toast");
      document.querySelector(".cart").addEventListener("click", () => {
        toast.textContent = count
          ? `${count} Lorem ipsum`
          : "Lorem ipsum dolor sit amet.";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2400);
      });
      document.querySelectorAll(".product").forEach((product) =>
        product.addEventListener("click", () => {
          count++;
          document.getElementById("cart-count").textContent = count;
          toast.textContent = `${product.querySelector(".product-name").textContent} lorem ipsum`;
          toast.classList.add("show");
          setTimeout(() => toast.classList.remove("show"), 2400);
        })
      );
      document.getElementById("signup").addEventListener("submit", (event) => {
        event.preventDefault();
        toast.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        toast.classList.add("show");
        event.target.reset();
        setTimeout(() => toast.classList.remove("show"), 3000);
      });
