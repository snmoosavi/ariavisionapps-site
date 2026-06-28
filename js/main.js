(() => {
  const normalize = (value) => (value || "").toString().trim().toLowerCase();
  const searchInput = document.querySelector("#appSearch");
  const productGrid = document.querySelector("#productGrid");
  const emptyState = document.querySelector("#emptyState");
  const filterButtons = [...document.querySelectorAll(".filter-pill[data-filter]")];
  let activeFilter = "all";

  function filterCards() {
    if (!productGrid) return;
    const query = normalize(searchInput?.value);
    let visible = 0;
    productGrid.querySelectorAll(".product-card").forEach((card) => {
      const haystack = normalize([card.dataset.title, card.dataset.category, card.dataset.description].join(" "));
      const category = normalize(card.dataset.category);
      const matchesSearch = !query || haystack.includes(query);
      const matchesFilter = activeFilter === "all" || category.split(",").map((item) => normalize(item)).includes(activeFilter) || category.includes(activeFilter);
      const show = matchesSearch && matchesFilter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (emptyState) emptyState.hidden = visible !== 0;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = normalize(button.dataset.filter) || "all";
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      filterCards();
    });
  });
  searchInput?.addEventListener("input", filterCards);
  filterCards();

  let lightbox;
  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";
    lightbox.innerHTML = '<div class="lightbox-inner" role="dialog" aria-modal="true" aria-label="Screenshot preview"><button class="lightbox-close" type="button" aria-label="Close preview">x</button><img alt=""><p class="lightbox-caption"></p></div>';
    document.body.appendChild(lightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target.closest(".lightbox-close")) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });
    return lightbox;
  }

  function openLightbox(src, caption) {
    if (!src) return;
    const box = ensureLightbox();
    const image = box.querySelector("img");
    const text = box.querySelector(".lightbox-caption");
    image.src = src;
    image.alt = caption || "Product screenshot";
    text.textContent = caption || "";
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  const mainScreenshot = document.querySelector("#mainScreenshot");
  const mainCaption = document.querySelector("#mainScreenshotCaption");
  document.querySelectorAll(".screenshot-thumb").forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.dataset.image || "";
      const caption = button.dataset.caption || "Product screenshot";
      if (mainScreenshot && src) {
        mainScreenshot.src = src;
        mainScreenshot.alt = caption;
      }
      if (mainCaption) mainCaption.textContent = caption;
      document.querySelectorAll(".screenshot-thumb").forEach((item) => item.classList.toggle("is-active", item === button));
      openLightbox(src, caption);
    });
  });

  document.querySelectorAll(".image-open").forEach((button) => {
    button.addEventListener("click", () => openLightbox(button.dataset.image, button.dataset.caption));
  });
})();
