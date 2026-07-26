// ============================================
// BUSINESS FOUNDERS — Book detail page effects
// Reads data-effect from <body> and drives the
// hero book's signature 3D behaviour.
// ============================================

(function () {
  // Collapsible table of contents
  document.querySelectorAll(".bp-toc-toggle").forEach((btn) => {
    const toc = document.querySelector(".bp-toc");
    if (!toc) return;
    btn.addEventListener("click", () => {
      const open = toc.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "Show less ↑" : btn.dataset.label;
    });
  });

  const stage = document.querySelector(".stage");
  const tiltEl = document.querySelector(".stage-tilt");
  if (!stage || !tiltEl) return;

  const effect = document.body.dataset.effect;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Curve: measure, then draw once on load
  if (effect === "curve") {
    const path = document.querySelector(".curve-path");
    if (path) {
      document.body.style.setProperty("--len", Math.ceil(path.getTotalLength()));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => document.body.classList.add("drawn"))
      );
    }
  }

  if (reduce) {
    document.body.classList.add("drawn");
    return;
  }

  // Grid: periodic idle ripple
  if (effect === "grid") {
    const cover = document.querySelector(".grid-cover");
    if (cover) {
      setInterval(() => {
        cover.classList.add("ripple");
        setTimeout(() => cover.classList.remove("ripple"), 1700);
      }, 5400);
    }
  }

  // Desktop: pointer tilt. Touch: gentle scroll tilt.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let raf = null;
    stage.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tiltEl.style.transform =
          `perspective(950px) rotateY(${(x * 12).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
      });
    });
    stage.addEventListener("pointerleave", () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      tiltEl.style.transform = "";
    });
  } else {
    let raf = null;
    const fx = () => {
      raf = null;
      const r = stage.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const half = window.innerHeight / 2;
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - half) / half));
      tiltEl.style.transform = `perspective(950px) rotateX(${(p * 7).toFixed(2)}deg)`;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!raf) raf = requestAnimationFrame(fx);
      },
      { passive: true }
    );
    fx();
  }
})();
