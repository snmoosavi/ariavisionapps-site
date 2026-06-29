(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const normalize = (value) => (value || "").toString().trim().toLowerCase();
  const siteHeader = document.querySelector(".site-header");
  const searchInput = document.querySelector("#appSearch");
  const productGrid = document.querySelector("#productGrid");
  const emptyState = document.querySelector("#emptyState");
  const filterButtons = [...document.querySelectorAll(".filter-pill[data-filter]")];
  const productCards = productGrid ? [...productGrid.querySelectorAll(".product-card")] : [];
  let activeFilter = "all";
  let lightbox;

  document.body.classList.add("js-ready");

  function updateHeaderState() {
    siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  function filterCards() {
    if (!productGrid) return;
    const query = normalize(searchInput?.value);
    let visible = 0;

    productCards.forEach((card, index) => {
      const haystack = normalize([card.dataset.title, card.dataset.category, card.dataset.description].join(" "));
      const category = normalize(card.dataset.category);
      const categories = category.split(",").map((item) => normalize(item));
      const matchesSearch = !query || haystack.includes(query);
      const matchesFilter = activeFilter === "all" || categories.includes(activeFilter) || category.includes(activeFilter);
      const show = matchesSearch && matchesFilter;

      card.hidden = !show;
      card.classList.remove("is-filtered-in");
      if (show) {
        visible += 1;
        if (!prefersReducedMotion) {
          card.style.animationDelay = `${Math.min(index, 8) * 18}ms`;
          requestAnimationFrame(() => card.classList.add("is-filtered-in"));
          window.setTimeout(() => {
            card.style.animationDelay = "";
          }, 360);
        }
      }
    });

    if (emptyState) emptyState.hidden = visible !== 0;
  }

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
    box.querySelector(".lightbox-close")?.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function setupRevealEffects() {
    const revealTargets = [
      ...document.querySelectorAll(".reveal"),
      ...document.querySelectorAll(".product-card, .value-grid article, .screenshot-thumb, .related-link, .promo-panel, .app-main, .feature-list li, .contact-panel")
    ];
    const uniqueTargets = [...new Set(revealTargets)];

    uniqueTargets.forEach((element, index) => {
      element.classList.add("reveal-target");
      element.style.transitionDelay = prefersReducedMotion ? "0ms" : `${Math.min(index % 8, 7) * 45}ms`;
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      uniqueTargets.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        window.setTimeout(() => {
          entry.target.style.transitionDelay = "";
        }, 760);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    uniqueTargets.forEach((element) => observer.observe(element));
  }

  function setupSmoothAnchors() {
    document.querySelectorAll('a[href*="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (!href || href === "#") return;
        const url = new URL(href, window.location.href);
        if (url.pathname !== window.location.pathname || url.origin !== window.location.origin) return;
        const target = document.querySelector(url.hash);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        history.pushState(null, "", url.hash);
      });
    });
  }

  function setupPressFeedback() {
    const selector = ".button, .filter-pill, .product-card, .related-link, .screenshot-thumb";
    document.addEventListener("pointerdown", (event) => {
      const target = event.target.closest(selector);
      if (!target) return;
      target.classList.add("is-pressing");
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
      document.addEventListener(type, (event) => {
        const target = event.target.closest(selector);
        target?.classList.remove("is-pressing");
      });
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = normalize(button.dataset.filter) || "all";
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      filterCards();
    });
  });

  searchInput?.addEventListener("input", filterCards);

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

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  updateHeaderState();
  setupRevealEffects();
  setupSmoothAnchors();
  setupPressFeedback();
  filterCards();
})();
