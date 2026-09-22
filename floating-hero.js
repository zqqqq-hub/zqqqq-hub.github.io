(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".floating-hero");
    if (!hero) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const icons = [...hero.querySelectorAll(".floating-tool")].map((anchor) => ({
      anchor,
      body: anchor.querySelector(".floating-tool-repel"),
      x: 0, y: 0, vx: 0, vy: 0,
    }));
    let pointer = null;
    let frame = 0;
    let lastTime = 0;
    let inView = true;

    // Same unit-mass spring and repulsion as the reference: k=300, c=20,
    // radius=150px, maximum displacement=50px. The anchor stays untransformed
    // so icon movement cannot feed back into the distance calculation.
    function animate(time) {
      frame = 0;
      const dt = Math.min((time - lastTime) / 1000 || 1 / 60, 1 / 30);
      lastTime = time;
      let moving = false;
      icons.forEach((icon) => {
        let targetX = 0;
        let targetY = 0;
        if (pointer) {
          const rect = icon.anchor.getBoundingClientRect();
          const dx = pointer.x - rect.left - rect.width / 2;
          const dy = pointer.y - rect.top - rect.height / 2;
          const distance = Math.hypot(dx, dy);
          if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            const force = (1 - distance / 150) * 50;
            targetX = -Math.cos(angle) * force;
            targetY = -Math.sin(angle) * force;
          }
        }
        // Substeps keep the spring stable on low-refresh or busy devices.
        const steps = Math.ceil(dt / (1 / 120));
        const step = dt / steps;
        for (let i = 0; i < steps; i++) {
          icon.vx += (300 * (targetX - icon.x) - 20 * icon.vx) * step;
          icon.vy += (300 * (targetY - icon.y) - 20 * icon.vy) * step;
          icon.x += icon.vx * step;
          icon.y += icon.vy * step;
        }
        if (Math.hypot(targetX - icon.x, targetY - icon.y, icon.vx, icon.vy) < .05) {
          icon.x = targetX; icon.y = targetY; icon.vx = 0; icon.vy = 0;
        } else moving = true;
        icon.body.style.transform = `translate(${icon.x}px, ${icon.y}px)`;
      });
      if (moving) frame = requestAnimationFrame(animate);
    }

    function start() {
      if (frame || reduced.matches || !finePointer.matches || !inView || document.hidden) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    }

    function release() { pointer = null; start(); }

    function syncMotion() {
      const paused = !inView || document.hidden || reduced.matches;
      hero.classList.toggle("is-paused", paused);
      if (paused || !finePointer.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        pointer = null;
        icons.forEach((icon) => {
          icon.x = icon.y = icon.vx = icon.vy = 0;
          icon.body.style.transform = "";
        });
      }
    }

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" || reduced.matches || !finePointer.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      start();
    }, { passive: true });
    hero.addEventListener("pointerleave", release);
    hero.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    window.addEventListener("scroll", release, { passive: true });
    window.addEventListener("resize", release, { passive: true });
    reduced.addEventListener("change", syncMotion);
    finePointer.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncMotion();
      }).observe(hero);
    }
    syncMotion();
  });
})();
