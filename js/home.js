// ============================================
// BUSINESS FOUNDERS — Home compartment engine
// Entrance choreography, scroll-linked tilt, and
// the counting numbers in the proof compartment.
// ============================================

(function () {
  const comps = Array.from(document.querySelectorAll(".comp"));
  if (!comps.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- entrance: fires once the section has landed ----------
  // 55% threshold so the snap animation finishes before anything
  // moves; running both at once stalls the scroll on phones.
  const showIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => e.target.classList.toggle("shown", e.isIntersecting));
    },
    { threshold: 0.55 }
  );
  comps.forEach((c) => showIO.observe(c));

  // ---------- centre-stage ----------
  const activeIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => e.target.classList.toggle("active", e.isIntersecting));
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
  );
  comps.forEach((c) => activeIO.observe(c));

  // ---------- counting numbers ----------
  function runCount(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const compact = el.dataset.compact === "1";
    if (reduce) {
      el.textContent = format(target);
      return;
    }
    const dur = 1300;
    const start = performance.now();
    function format(v) {
      if (compact && target >= 1000) return Math.round(v / 1000) + "K" + suffix;
      return v.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix;
    }
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) runCount(e.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countIO.observe(c));
  }

  if (reduce) {
    comps.forEach((c) => c.classList.add("shown", "active"));
    return;
  }

  // ---------- continuous scroll-linked tilt on each stage ----------
  const stages = comps
    .map((c) => ({ comp: c, tilt: c.querySelector(".stage-tilt") }))
    .filter((s) => s.tilt);

  let raf = null;
  const scrollFx = () => {
    raf = null;
    const half = window.innerHeight / 2;
    stages.forEach(({ comp, tilt }) => {
      const r = tilt.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - half) / half));
      tilt.style.transform = `perspective(1000px) rotateX(${(p * 7).toFixed(2)}deg)`;
      comp.style.setProperty("--scrollp", p.toFixed(3));
    });
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(scrollFx);
    },
    { passive: true }
  );
  scrollFx();

  // ---------- desktop pointer tilt ----------
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    stages.forEach(({ tilt }) => {
      const stage = tilt.parentElement;
      let praf = null;
      stage.addEventListener("pointermove", (e) => {
        if (praf) return;
        praf = requestAnimationFrame(() => {
          praf = null;
          const r = stage.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          tilt.style.transform =
            `perspective(1000px) rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 11).toFixed(2)}deg)`;
        });
      });
      stage.addEventListener("pointerleave", () => {
        if (praf) cancelAnimationFrame(praf);
        praf = null;
        tilt.style.transform = "";
      });
    });
  } else {
    // touch: tapping a stage replays its entrance
    stages.forEach(({ comp, tilt }) => {
      tilt.addEventListener("click", () => {
        comp.classList.remove("shown");
        void comp.offsetWidth;
        requestAnimationFrame(() => comp.classList.add("shown"));
      });
    });
  }
})();
