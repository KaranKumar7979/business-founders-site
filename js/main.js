// ============================================
// BUSINESS FOUNDERS: UI interactions
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
      // Phones stack cards in one column, side tilts would just look
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

// Lead forms: submit to Formspree via fetch.
// Until a real form ID is set in the action, we never fake a
// success, the visitor is told to DM instead, so no enquiry
// is silently lost.
document.querySelectorAll("form.lead-form").forEach((form) => {
  const errorEl = form.querySelector(".form-error");
  const successEl = form.parentElement.querySelector(".form-success");
  const button = form.querySelector('button[type="submit"]');

  function fail(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (form.action.includes("REPLACE_ME")) {
      fail(
        "Our enquiry form is being switched on shortly. In the meantime, please DM @businessfounders_ on Instagram and we'll pick it up there."
      );
      return;
    }

    const label = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Sending…";
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(res.status);
      form.style.display = "none";
      if (successEl) successEl.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (button) {
        button.disabled = false;
        button.textContent = label;
      }
      fail(
        "Something went wrong sending that. Please try again, or DM @businessfounders_ on Instagram."
      );
    }
  });
});

// ---------- Links whose destination does not exist yet ----------
// Same discipline as the REPLACE_ME forms: never send a visitor to a
// 404, and never imply something is ready when it is not. Drop the
// data-pending attribute once the href points somewhere real.
document.querySelectorAll("[data-pending]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const msg = el.dataset.pendingMsg || "This one is not live yet.";
    let note = el.parentElement.querySelector(".pending-note");
    if (!note) {
      note = document.createElement("p");
      note.className = "pending-note";
      note.setAttribute("role", "status");
      el.insertAdjacentElement("afterend", note);
    }
    note.textContent = msg;
  });
});

// Footer year
document.querySelectorAll(".year").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
