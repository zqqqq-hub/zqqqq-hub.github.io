(function () {
  const root = document.documentElement;
  try {
    const entry = JSON.parse(sessionStorage.getItem("zq-case-transition") || "null");
    sessionStorage.removeItem("zq-case-transition");
    if (entry && entry.target === location.href && Date.now() - entry.time < 10000 &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.__caseTransition = entry;
      root.style.setProperty("--case-transition-image", `url(${JSON.stringify(entry.src)})`);
      root.classList.add("motion-pending");
    }
  } catch {
    // Navigation still works when session storage is unavailable.
  }
  window.__portfolioMotionFallback = setTimeout(() => root.classList.remove("motion-pending"), 2600);
})();
