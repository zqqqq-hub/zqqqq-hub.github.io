(function () {
  const ROOT = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storageKeys = {
    homeScroll: "zq-motion-home-scroll",
    returnToWorks: "zq-motion-return-to-works",
  };
  const pageType = document.body.dataset.page || "home";
  const state = { value: "idle" };
  let parallaxFrame;

  const storage = {
    get(key) {
      try {
        return window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.sessionStorage.setItem(key, String(value));
      } catch {
        // Motion is progressive enhancement; private browsing must not block navigation.
      }
    },
    remove(key) {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // Ignore unavailable storage.
      }
    },
  };

  function removePendingCover() {
    window.clearTimeout(window.__portfolioMotionFallback);
    ROOT.classList.remove("motion-pending");
  }

  function isReduced() {
    return reducedMotion.matches;
  }

  function clearCover() {
    document.querySelectorAll(".case-transition-cover").forEach((cover) => cover.remove());
  }

  function revealPage() {
    ROOT.classList.add("motion-enabled");
    const entry = window.__caseTransition;
    if (!entry || isReduced()) {
      removePendingCover();
      state.value = "idle";
      return;
    }
    const cover = createCover(entry.src);
    const firstImage = document.querySelector("main img");
    const ready = firstImage?.decode ? firstImage.decode().catch(() => {}) : Promise.resolve();
    Promise.race([ready, new Promise((resolve) => setTimeout(resolve, 900))]).then(() => {
      removePendingCover();
      const animation = cover.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: isReduced() ? 0 : 320, easing: "ease-out", fill: "forwards",
      });
      animation.finished.then(() => { cover.remove(); state.value = "idle"; });
    });
  }

  function createCover(src) {
    const cover = document.createElement("div");
    cover.className = "case-transition-cover";
    cover.setAttribute("aria-hidden", "true");
    const image = new Image();
    image.src = src;
    image.alt = "";
    cover.append(image);
    document.body.append(cover);
    return cover;
  }

  function revealFlowItems() {
    const items = [...document.querySelectorAll("[data-motion-reveal], .reveal, .reveal-block")];
    if (!items.length) return;

    const show = (item, delay = 0) => {
      item.style.setProperty("--motion-delay", `${delay}ms`);
      item.classList.add("is-visible", "is-motion-visible");
    };

    if (isReduced() || !("IntersectionObserver" in window)) {
      items.forEach((item) => show(item));
      return;
    }

    const heroItems = [...document.querySelectorAll("[data-motion-hero] [data-motion-reveal]")];
    heroItems.forEach((item, index) => show(item, 100 + index * 80));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const siblings = [...entry.target.parentElement?.querySelectorAll(":scope > [data-motion-reveal]") || []];
          const index = Math.max(0, siblings.indexOf(entry.target));
          show(entry.target, Math.min(index * 70, 210));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    items.filter((item) => !heroItems.includes(item)).forEach((item) => observer.observe(item));
  }

  function updateParallax() {
    parallaxFrame = undefined;
    document.querySelectorAll("[data-motion-parallax]").forEach((item) => {
      const media = item.closest(".project-index-media");
      if (!media) return;
      const rect = media.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      item.style.setProperty("--motion-parallax-y", `${Math.round(progress * -12)}px`);
    });
  }

  function installParallax() {
    if (isReduced() || window.matchMedia("(max-width: 768px)").matches) return;
    const requestUpdate = () => {
      if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    requestUpdate();
  }

  function installCardTilt() {
    const hoverPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    document.querySelectorAll(".project-index-card").forEach((card) => {
      const link = card.querySelector("a");
      const reset = () => {
        link.style.removeProperty("--card-rotate-x");
        link.style.removeProperty("--card-rotate-y");
        link.classList.remove("is-tilting");
      };
      card.addEventListener("pointermove", (event) => {
        if (isReduced() || !hoverPointer.matches || event.pointerType === "touch") return;
        // Measure the stable wrapper so the transformed link cannot feed back into its rotation.
        const rect = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        link.style.setProperty("--card-rotate-x", `${(y - 0.5) * 15}deg`);
        link.style.setProperty("--card-rotate-y", `${(x - 0.5) * -15}deg`);
        link.classList.add("is-tilting");
      });
      card.addEventListener("pointerleave", reset);
      card.addEventListener("pointercancel", reset);
      window.addEventListener("blur", reset);
      window.addEventListener("scroll", reset, { passive: true });
      reducedMotion.addEventListener("change", reset);
      hoverPointer.addEventListener("change", reset);
    });
  }

  function installTouchCardFocus() {
    if (isReduced() || !("IntersectionObserver" in window)) return;
    const touchPointer = window.matchMedia("(hover: none), (pointer: coarse)");
    if (!touchPointer.matches) return;

    const cards = [...document.querySelectorAll(".project-index-card")];
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-touch-focused", entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: "-24% 0px -30% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
  }

  function isHome(url) {
    return /(?:^|\/)index\.html$/.test(url.pathname) || url.pathname === "/";
  }

  function shouldIntercept(event, anchor, url) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download") || anchor.hasAttribute("data-lightbox-src")) return false;
    if (url.origin !== window.location.origin || !/\.html$/.test(url.pathname)) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
    return state.value === "idle";
  }

  function goTo(url, anchor) {
    const media = anchor.querySelector(".project-index-media");
    const image = media?.querySelector("img");
    if (isReduced() || !image?.complete || !image.naturalWidth) {
      window.location.assign(url.href);
      return;
    }

    state.value = "covering";
    const rect = media.getBoundingClientRect();
    const src = image.currentSrc || image.src;
    storage.set("zq-case-transition", JSON.stringify({ src, target: url.href, time: Date.now() }));
    const cover = createCover(src);
    const animation = cover.animate([
      { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: "8px" },
      { left: "0px", top: "0px", width: `${window.innerWidth}px`, height: `${window.innerHeight}px`, borderRadius: "0px" },
    ], { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" });
    animation.finished.then(() => window.location.assign(url.href));
  }

  function installPageTransitions() {
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (!shouldIntercept(event, anchor, url)) return;

      if (pageType === "home") storage.set(storageKeys.homeScroll, window.scrollY);
      if (pageType === "detail" && isHome(url) && url.hash === "#works") {
        storage.set(storageKeys.returnToWorks, "true");
      }

      event.preventDefault();
      goTo(url, anchor);
    }, true);
  }

  function restoreHomeScroll() {
    if (pageType !== "home" || storage.get(storageKeys.returnToWorks) !== "true") return;
    const savedY = Number(storage.get(storageKeys.homeScroll));
    storage.remove(storageKeys.returnToWorks);
    if (!Number.isFinite(savedY)) return;
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: savedY, behavior: "auto" })));
  }

  function handleReducedMotionChange(event) {
    if (!event.matches) return;
    ROOT.classList.add("motion-reduced");
    removePendingCover();
    clearCover();
    document.querySelectorAll("[data-motion-reveal], .reveal, .reveal-block").forEach((item) => {
      item.classList.add("is-visible", "is-motion-visible");
    });
  }

  function init() {
    if (isReduced()) ROOT.classList.add("motion-reduced");
    revealFlowItems();
    revealPage();
    restoreHomeScroll();
    installTouchCardFocus();
    installParallax();
    installCardTilt();
    installPageTransitions();
    reducedMotion.addEventListener?.("change", handleReducedMotionChange);
    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      state.value = "idle";
      clearCover();
      removePendingCover();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
