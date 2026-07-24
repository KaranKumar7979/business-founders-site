// ============================================
// BUSINESS FOUNDERS — Founder Series book cards
// Renders one BookCard per BOOK_THEMES entry and
// drives the per-theme 3D effects.
// Animation rules: transform + opacity only;
// shadows/glows are pre-rendered layers cross-faded
// by opacity, never animated box-shadows.
// ============================================

(function () {
  const mount = document.getElementById("book-series-grid");
  if (!mount || typeof BOOK_THEMES === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Max pointer-tilt in degrees per effect (shelf choreographs its own rotation)
  const TILT = { shelf: 0, lift: 5, curve: 7, grid: 8 };

  // ---------- colour helpers (pre-compute tile ramp; no runtime blending) ----------
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lerpHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
  }
  function alphaHex(hex, alpha) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---------- cover builders (one per effect) ----------
  function coverImage(theme) {
    const pic = document.createElement("picture");
    if (theme.cover.webp) {
      const src = document.createElement("source");
      src.srcset = theme.cover.webp;
      src.type = "image/webp";
      pic.appendChild(src);
    }
    const img = document.createElement("img");
    img.src = theme.cover.png;
    img.alt = `Cover of “${theme.title}”`;
    img.loading = "lazy";
    img.decoding = "async";
    img.className = "cover-img";
    pic.appendChild(img);
    return pic;
  }

  // Typographic stand-in until the real 1800x2700 covers are exported
  function coverText(theme, titleZ) {
    const art = document.createElement("div");
    art.className = "cover-art";
    art.innerHTML =
      `<span class="cover-brand">Business Founders</span>` +
      `<span class="cover-title"${titleZ ? ` style="transform:translateZ(${titleZ}px)"` : ""}>${theme.title}</span>` +
      `<span class="cover-num">${theme.num}</span>`;
    return art;
  }

  function buildShelfCover(theme) {
    // A real 3D book: front face + spine joined with preserve-3d.
    // Resting rotateY(-22deg) shows the spine; hover straightens and lifts.
    const book = document.createElement("div");
    book.className = "book3d";

    const face = document.createElement("div");
    face.className = "book-face";
    face.appendChild(theme.cover ? coverImage(theme) : coverText(theme));
    const rim = document.createElement("div");
    rim.className = "book-rim";
    face.appendChild(rim);

    const spine = document.createElement("div");
    spine.className = "book-spine";
    spine.innerHTML = `<span>${theme.title}</span>`;

    book.appendChild(spine);
    book.appendChild(face);
    return book;
  }

  function buildLiftCover(theme) {
    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.appendChild(theme.cover ? coverImage(theme) : coverText(theme, 40));
    const spark = document.createElement("span");
    spark.className = "bk-spark";
    spark.textContent = "✦";
    spark.setAttribute("aria-hidden", "true");
    cover.appendChild(spark);
    return cover;
  }

  function buildCurveCover(theme) {
    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.appendChild(theme.cover ? coverImage(theme) : coverText(theme, 80));

    // Inline SVG so the curve can draw itself on scroll-in
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 200 300");
    svg.setAttribute("class", "curve");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
      `<path class="curve-path" d="M 18 258 C 70 252, 100 170, 132 116 S 168 58 180 44" />` +
      `<circle class="node-glow" cx="180" cy="44" r="16" />` +
      `<circle class="node" cx="180" cy="44" r="5" />`;
    cover.appendChild(svg);
    return cover;
  }

  function buildGridCover(theme) {
    // The 3x3 grid IS the cover: tiles ramp muted-wine -> gold,
    // and the hover ripple replays that ramp in depth.
    const cover = document.createElement("div");
    cover.className = "book-cover grid-cover";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const t = (r + c) / 4; // 0 at top-left, 1 at bottom-right
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.style.setProperty("--tile-c", lerpHex(theme.colors.tile, theme.colors.accent, t));
        tile.style.setProperty("--lift", `${Math.round(10 + t * 35)}px`);
        tile.style.setProperty("--rd", `${(r + c) * 60}ms`);
        cover.appendChild(tile);
      }
    }
    return cover;
  }

  const COVERS = {
    shelf: buildShelfCover,
    lift: buildLiftCover,
    curve: buildCurveCover,
    grid: buildGridCover,
  };

  // ---------- shared BookCard ----------
  function buildCard(theme) {
    const wrap = document.createElement("div");
    wrap.className = `book-wrap fx-${theme.effect}`;
    const c = theme.colors;
    wrap.style.setProperty("--bk-bg-top", c.bgTop);
    wrap.style.setProperty("--bk-bg-bottom", c.bgBottom);
    wrap.style.setProperty("--bk-accent", c.accent);
    wrap.style.setProperty("--bk-accent-soft", alphaHex(c.accent, 0.45));
    wrap.style.setProperty("--bk-text", c.text);
    wrap.style.setProperty("--bk-muted", c.muted);
    wrap.style.setProperty("--bk-font", theme.fontDisplay);

    // Pre-rendered shadow pair + glow, cross-faded by opacity
    wrap.innerHTML =
      `<div class="bk-shadow tight" aria-hidden="true"></div>` +
      `<div class="bk-shadow soft" aria-hidden="true"></div>` +
      (theme.effect === "lift" ? `<div class="bk-glow" aria-hidden="true"></div>` : "");

    const link = document.createElement("a");
    link.className = "book-card";
    link.href = theme.href;
    link.setAttribute("aria-label", `${theme.title} — ${theme.subtitle}`);

    const tilt = document.createElement("div");
    tilt.className = "tilt";
    tilt.appendChild(COVERS[theme.effect](theme));

    const meta = document.createElement("div");
    meta.className = "book-meta";
    meta.innerHTML =
      `<h3>${theme.title}</h3>` +
      `<p>${theme.subtitle}</p>` +
      `<span class="book-link">View the Book →</span>`;
    tilt.appendChild(meta);

    link.appendChild(tilt);
    wrap.appendChild(link);
    return wrap;
  }

  const wraps = BOOK_THEMES.map((theme) => {
    const el = buildCard(theme);
    mount.appendChild(el);
    return { el, theme, inView: false, drawn: false };
  });

  // ---------- curve: measure path length so CSS can draw it ----------
  wraps.forEach(({ el, theme }) => {
    if (theme.effect !== "curve") return;
    const path = el.querySelector(".curve-path");
    const len = Math.ceil(path.getTotalLength());
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
  });

  // ---------- visibility: no work for off-screen cards ----------
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = wraps.find((w) => w.el === entry.target);
        if (!item) return;
        item.inView = entry.isIntersecting;
        entry.target.classList.toggle("in-view", entry.isIntersecting);
        // Draw the curve once per page load, not on every pass
        if (entry.isIntersecting && item.theme.effect === "curve" && !item.drawn) {
          item.drawn = true;
          entry.target.classList.add("drawn");
        }
      });
    },
    { threshold: 0.2 }
  );
  wraps.forEach(({ el }) => io.observe(el));

  // Under reduced motion the curve must still be visible — show it drawn
  if (reduceMotion.matches) {
    wraps.forEach(({ el, theme }) => {
      if (theme.effect === "curve") el.classList.add("drawn");
    });
  }

  // ---------- touch devices: scroll-driven effects ----------
  // Phones never hover, so the card plays its full effect while it
  // travels through the middle band of the viewport, and settles
  // back as it scrolls out. The .active class mirrors :hover in CSS.
  if (window.matchMedia("(hover: none)").matches && !reduceMotion.matches) {
    const centerBand = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("active", entry.isIntersecting);
        });
      },
      // Middle ~26% of the viewport counts as "in focus"
      { rootMargin: "-37% 0px -37% 0px", threshold: 0 }
    );
    wraps.forEach(({ el }) => centerBand.observe(el));
  }

  // ---------- pointer tilt (desktop only, rAF-throttled) ----------
  wraps.forEach((item) => {
    const max = TILT[item.theme.effect];
    if (!max || !finePointer.matches || reduceMotion.matches) return;

    const card = item.el.querySelector(".book-card");
    const tiltEl = item.el.querySelector(".tilt");
    let raf = null;

    card.addEventListener("pointerenter", () => {
      if (!item.inView) return;
      tiltEl.style.willChange = "transform";
    });
    card.addEventListener("pointermove", (e) => {
      if (!item.inView || raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        tiltEl.style.transform =
          `rotateY(${(x * 2 * max).toFixed(2)}deg) rotateX(${(-y * 2 * max).toFixed(2)}deg)`;
      });
    });
    card.addEventListener("pointerleave", () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      tiltEl.style.transform = "";
      tiltEl.style.willChange = "";
    });
  });
})();
