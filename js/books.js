// ============================================
// BUSINESS FOUNDERS: Founder Series compartments
// One full-screen themed section per book, rendered
// from BOOK_THEMES (js/books-config.js).
//
// Choreography model:
//   .shown  : section entered the viewport: the book sweeps in
//             from the right and the meta text follows (replays
//             every visit so scrolling back re-runs the show).
//   .active: section is centre-stage (snapped): the book's
//             signature effect plays (shelf opens, lift rises,
//             curve node glows, grid ripples gold).
//   --scrollp / rotateX tilt, continuous scroll-linked motion.
//
// Animation rules: transform + opacity only; pre-rendered
// shadow/glow layers are cross-faded, never animated shadows.
// ============================================

(function () {
  const mount = document.getElementById("book-comps");
  if (!mount || typeof BOOK_THEMES === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Max pointer-tilt in degrees per effect (desktop only;
  // shelf choreographs its own rotation)
  const TILT = { shelf: 0, lift: 5, curve: 7, grid: 8 };

  // ---------- colour helpers ----------
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
  function coverText(theme) {
    const art = document.createElement("div");
    art.className = "cover-art";
    art.innerHTML =
      `<span class="cover-brand">Business Founders</span>` +
      `<span class="cover-title">${theme.title}</span>` +
      `<span class="cover-num">${theme.num}</span>`;
    return art;
  }

  function buildShelfCover(theme) {
    // One rotated plane; the spine is a foreshortened strip on its
    // trailing edge (two real 3D faces trigger mobile renderer bugs)
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
    book.appendChild(face);
    book.appendChild(spine);
    return book;
  }

  function buildLiftCover(theme) {
    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.appendChild(theme.cover ? coverImage(theme) : coverText(theme));
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
    cover.appendChild(theme.cover ? coverImage(theme) : coverText(theme));
    // Inline SVG so the curve can draw itself on section entry
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
    // The 3x3 grid was the stand-in cover: tiles cascade in on entry, then
    // the centre-stage ripple lifts them and turns them gold. The real
    // cover has that same grid printed on it, so once it exists the
    // artwork wins and the tiles would only double it up.
    if (theme.cover) {
      const real = document.createElement("div");
      real.className = "book-cover";
      real.appendChild(coverImage(theme));
      return real;
    }
    const cover = document.createElement("div");
    cover.className = "book-cover grid-cover";
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const t = (r + c) / 4; // 0 top-left → 1 bottom-right
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.style.setProperty("--tile-c", lerpHex(theme.colors.tile, theme.colors.accent, t));
        tile.style.setProperty("--lift", `${Math.round(12 + t * 40)}px`);
        tile.style.setProperty("--rd", `${(r + c) * 70}ms`);
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

  // ---------- one compartment per book ----------
  function buildComp(theme) {
    const sec = document.createElement("section");
    sec.className = `comp comp-book fx-${theme.effect}`;
    const c = theme.colors;
    sec.style.setProperty("--bk-bg-top", c.bgTop);
    sec.style.setProperty("--bk-bg-bottom", c.bgBottom);
    sec.style.setProperty("--bk-accent", c.accent);
    sec.style.setProperty("--bk-accent-soft", alphaHex(c.accent, 0.45));
    sec.style.setProperty("--bk-accent-faint", alphaHex(c.accent, 0.14));
    sec.style.setProperty("--bk-text", c.text);
    sec.style.setProperty("--bk-muted", c.muted);
    sec.style.setProperty("--bk-font", theme.fontDisplay);

    const bg = document.createElement("div");
    bg.className = "comp-bg";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML = `<span class="comp-watermark">${theme.num}</span>`;
    sec.appendChild(bg);

    const inner = document.createElement("div");
    inner.className = "comp-inner";

    const stage = document.createElement("div");
    stage.className = "stage";
    const tilt = document.createElement("div");
    tilt.className = "stage-tilt";
    tilt.appendChild(COVERS[theme.effect](theme));
    stage.appendChild(tilt);
    if (theme.effect === "lift") {
      const glow = document.createElement("div");
      glow.className = "bk-glow";
      glow.setAttribute("aria-hidden", "true");
      stage.appendChild(glow);
    }
    inner.appendChild(stage);

    const meta = document.createElement("div");
    meta.className = "comp-meta";
    meta.innerHTML =
      `<span class="eyebrow comp-eyebrow">Book ${theme.num} of The Founder Series</span>` +
      `<h2>${theme.title}</h2>` +
      `<p>${theme.subtitle}</p>` +
      // Price and a free chapter belong on the shelf, not two clicks in.
      // Without them a visitor swipes four screens before meeting a number.
      (theme.price
        ? `<div class="comp-price"><span class="now">${theme.price}</span>` +
          (theme.priceWas ? `<span class="was">${theme.priceWas}</span>` : "") +
          `</div>`
        : "") +
      `<div class="comp-actions">` +
      `<a class="comp-cta" href="${theme.href}" aria-label="See ${theme.title}">See the Book →</a>` +
      (theme.chapterPdf
        ? `<a class="comp-cta comp-cta-ghost" href="${theme.chapterPdf}" target="_blank" rel="noopener"` +
          ` aria-label="Read chapter one of ${theme.title}, free">Read Chapter One</a>`
        : "") +
      `</div>`;
    inner.appendChild(meta);

    sec.appendChild(inner);
    return sec;
  }

  const comps = BOOK_THEMES.map((theme) => {
    const el = buildComp(theme);
    mount.appendChild(el);
    return {
      el,
      theme,
      stage: el.querySelector(".stage"),
      tiltEl: el.querySelector(".stage-tilt"),
      inView: false,
    };
  });

  // ---------- bundle minis: the four spines fanned together ----------
  const miniMount = document.getElementById("bundle-minis");
  if (miniMount) {
    BOOK_THEMES.forEach((t, i) => {
      const m = document.createElement("div");
      m.className = "mini";
      m.style.setProperty("--mtop", t.colors.bgTop);
      m.style.setProperty("--mbot", t.colors.bgBottom);
      m.style.setProperty("--macc", t.colors.accent);
      m.style.setProperty("--mi", i);
      m.innerHTML = `<span>${t.num}</span>`;
      miniMount.appendChild(m);
    });
  }

  // ---------- curve: measure path length so CSS can draw it ----------
  comps.forEach(({ el, theme }) => {
    if (theme.effect !== "curve") return;
    const path = el.querySelector(".curve-path");
    el.style.setProperty("--len", Math.ceil(path.getTotalLength()));
  });

  // ---------- section observers ----------
  // .shown: entrance choreography, replays on every visit.
  // Fires at 55% visibility so the snap animation has finished
  // landing the section before the book starts moving, running
  // both at once makes the snap stall on phones.
  const showIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("shown", entry.isIntersecting);
      });
    },
    { threshold: 0.55 }
  );
  comps.forEach(({ el }) => showIO.observe(el));
  document.querySelectorAll(".comp-bundle").forEach((s) => showIO.observe(s));

  // .active: centre-stage, the snapped section plays its full effect
  const activeIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const item = comps.find((w) => w.el === entry.target);
        if (item) item.inView = entry.isIntersecting;
        entry.target.classList.toggle("active", entry.isIntersecting);
      });
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
  );
  comps.forEach(({ el }) => activeIO.observe(el));

  // Reduced motion: everything lands in its final state, no choreography
  if (reduceMotion.matches) {
    document.querySelectorAll(".comp").forEach((s) => s.classList.add("shown", "active"));
    return;
  }

  // ---------- continuous scroll-linked tilt + parallax ----------
  let raf = null;
  const scrollFx = () => {
    raf = null;
    const half = window.innerHeight / 2;
    comps.forEach((item) => {
      const r = item.stage.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
      // -1 (stage at top of screen) .. 0 (centre) .. 1 (bottom)
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - half) / half));
      item.tiltEl.style.transform = `perspective(950px) rotateX(${(p * 7).toFixed(2)}deg)`;
      item.el.style.setProperty("--scrollp", p.toFixed(3));
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

  // ---------- desktop pointer tilt on the stage ----------
  comps.forEach((item) => {
    const max = TILT[item.theme.effect];
    if (!max || !finePointer.matches) return;
    let praf = null;
    item.stage.addEventListener("pointermove", (e) => {
      if (praf) return;
      praf = requestAnimationFrame(() => {
        praf = null;
        const r = item.stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        item.tiltEl.style.transform =
          `perspective(950px) rotateY(${(x * 2 * max).toFixed(2)}deg) rotateX(${(-y * 2 * max).toFixed(2)}deg)`;
      });
    });
    item.stage.addEventListener("pointerleave", () => {
      if (praf) cancelAnimationFrame(praf);
      praf = null;
      item.tiltEl.style.transform = "";
    });
  });

  // ---------- touch: tapping the book replays its entrance ----------
  if (window.matchMedia("(hover: none)").matches) {
    comps.forEach(({ el, stage }) => {
      stage.addEventListener("click", () => {
        el.classList.remove("shown", "active");
        void el.offsetWidth; // flush so the classes re-trigger transitions
        requestAnimationFrame(() => el.classList.add("shown", "active"));
      });
    });
  }
})();
