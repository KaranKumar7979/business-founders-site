// ============================================
// BUSINESS FOUNDERS: From the Page
// Builds the reel grid from js/feed-config.js and inserts it as a
// compartment right after the hero. Renders nothing at all when the
// list is empty, so an unfinished section never reaches a visitor.
// ============================================

(function () {
  const reels = typeof PAGE_REELS !== "undefined" ? PAGE_REELS : [];
  if (!reels.length) return;

  const mount = document.getElementById("page-feed");
  if (!mount) return;

  const HANDLE = "https://instagram.com/businessfounders_";
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const tiles = reels
    .filter((r) => r && r.thumb && r.url)
    .map((r, i) => {
      const label = r.caption
        ? `Watch the reel: ${esc(r.caption)}`
        : `Watch reel ${i + 1} on Instagram`;
      return (
        `<a class="reel" href="${esc(r.url)}" target="_blank" rel="noopener"` +
        ` style="--r:${i}" aria-label="${label}">` +
        `<img src="${esc(r.thumb)}" alt="" loading="lazy" decoding="async" width="720" height="1280" />` +
        `<span class="reel-play" aria-hidden="true">▶</span>` +
        (r.caption ? `<span class="reel-caption">${esc(r.caption)}</span>` : "") +
        `</a>`
      );
    })
    .join("");

  if (!tiles) return;

  const sec = document.createElement("section");
  sec.className = "comp comp-feed";
  sec.setAttribute(
    "style",
    "--c-top:#241A2E; --c-bottom:#0D0912; --c-accent:#C9A24C; " +
      "--c-faint:rgba(201,162,76,.13); --c-text:#F4EFE4; --c-muted:#A79CB0;"
  );
  sec.innerHTML =
    `<div class="comp-bg" aria-hidden="true"></div>` +
    `<div class="feed-wrap">` +
      `<div class="feed-head">` +
        `<span class="eyebrow">From the Page</span>` +
        `<h2>What We Post Every Day.</h2>` +
        `<p>The reels 200,000 founders follow us for. The books came out of the same work.</p>` +
      `</div>` +
      `<div class="reel-row">${tiles}</div>` +
      `<a class="comp-cta feed-cta" href="${HANDLE}" target="_blank" rel="noopener">Follow @businessfounders_</a>` +
    `</div>`;

  mount.replaceWith(sec);

  // The homepage choreography reads .comp elements once at load, so a
  // compartment added afterwards would never get its entrance class.
  // Reveal this one directly instead of reaching into that engine.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sec.classList.add("shown");
    return;
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("shown");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    ).observe(sec);
  } else {
    sec.classList.add("shown");
  }
})();
