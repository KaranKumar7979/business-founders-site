// ============================================
// BUSINESS FOUNDERS — UI interactions
// ============================================

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

// 3D floating tilt cards
function applyTilt(el, clientX, clientY) {
  const r = el.getBoundingClientRect();
  const x = (clientX - r.left) / r.width - 0.5;
  const y = (clientY - r.top) / r.height - 0.5;
  el.style.transform = `perspective(900px) rotateY(${(x * 16).toFixed(2)}deg) rotateX(${(-y * 12).toFixed(2)}deg) translateY(-8px) scale(1.02)`;
}

document.querySelectorAll(".grid").forEach((grid) => {
  const cols = grid.classList.contains("grid-2") ? 2 : 3;
  Array.from(grid.children)
    .filter((el) => el.classList.contains("card"))
    .forEach((card, i) => {
      // Outer wrapper carries the idle bob (and reveal fade) so it
      // never fights the card's own tilt transform
      const wrap = document.createElement("div");
      wrap.className = "float-wrap";
      ["reveal", "visible"].forEach((cls) => {
        if (card.classList.contains(cls)) {
          card.classList.remove(cls);
          wrap.classList.add(cls);
        }
      });
      grid.insertBefore(wrap, card);
      wrap.appendChild(card);

      card.classList.add("card-3d");
      const pos = i % cols;
      // Phones stack cards in one column — side tilts would just look
      // skewed, so rest flat there (touch tilt still applies)
      const mobile = window.matchMedia("(max-width: 680px)").matches;
      let rest;
      if (cols === 3 && pos === 1) {
        card.classList.add("featured");
        rest = mobile ? "perspective(900px)" : "perspective(900px) translateY(-12px)";
      } else if (pos === 0) {
        rest = mobile ? "perspective(900px)" : "perspective(900px) rotateY(12deg) rotateX(3deg)";
      } else {
        rest = mobile ? "perspective(900px)" : "perspective(900px) rotateY(-12deg) rotateX(3deg)";
      }
      card.dataset.rest = rest;
      card.style.transform = rest;

      card.addEventListener("mousemove", (e) => applyTilt(card, e.clientX, e.clientY));
      card.addEventListener("touchmove", (e) => {
        const t = e.touches[0];
        if (t) applyTilt(card, t.clientX, t.clientY);
      }, { passive: true });
      ["mouseleave", "touchend"].forEach((ev) =>
        card.addEventListener(ev, () => {
          card.style.transform = card.dataset.rest || "";
        })
      );
    });
});

// Reveal-on-scroll
const revealEls = Array.from(document.querySelectorAll(".reveal"));
function checkReveals() {
  const vh = window.innerHeight;
  for (let i = revealEls.length - 1; i >= 0; i--) {
    const el = revealEls[i];
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.92 && rect.bottom > 0) {
      el.classList.add("visible");
      revealEls.splice(i, 1);
    }
  }
  if (!revealEls.length) {
    window.removeEventListener("scroll", onScroll);
  }
}
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    checkReveals();
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
checkReveals();

// Editor application form (front-end only for now —
// wire the fetch() below to Formspree/your backend when ready)
const form = document.getElementById("editor-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.style.display = "none";
    document.querySelector(".form-success").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Footer year
document.querySelectorAll(".year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
