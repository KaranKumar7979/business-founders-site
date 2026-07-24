// ============================================
// BUSINESS FOUNDERS — Founder Series themes
// One entry per book. js/books.js renders a card
// from each entry; tweak colours here only.
// ============================================

const BOOK_THEMES = [
  {
    id: "grow-theme-page",
    num: "01",
    title: "How to Grow a Theme Page From Scratch",
    subtitle: "A Beginner's Guide to Building a US Audience",
    href: "#",
    effect: "shelf",
    fontDisplay: '"Lora", Georgia, serif',
    // When the real cover is exported, drop the files in images/covers/
    // and set: cover: { webp: "images/covers/book1.webp", png: "images/covers/book1.png" }
    cover: null,
    colors: {
      bgTop: "#1B3C58",
      bgBottom: "#0E2334",
      accent: "#C9A24C",
      text: "#F4EFE4",
      muted: "#C9BFAC",
    },
  },
  {
    id: "launch-with-ai",
    num: "02",
    title: "How to Launch a Business With AI",
    subtitle: "A Solo Creator's Guide, From Idea to First Sale",
    href: "#",
    effect: "lift",
    fontDisplay: '"Poppins", "Inter", sans-serif',
    cover: null,
    colors: {
      bgTop: "#ECF2FC",
      bgBottom: "#ECF2FC",
      accent: "#1B45D8",
      deep: "#1E3A8A",
      text: "#121A2B",
      // Spec palette said #78829B, but that's only 3.3:1 against the
      // light background — fails WCAG for body text. Darkened to pass 4.5:1.
      muted: "#586380",
    },
  },
  {
    id: "grow-with-ai",
    num: "03",
    title: "Growing Your Business With AI",
    subtitle: "Get More Customers and Revenue From What You Already Have",
    href: "#",
    effect: "curve",
    fontDisplay: '"Poppins", "Inter", sans-serif',
    cover: null,
    colors: {
      bgTop: "#175F45",
      bgBottom: "#062017",
      accent: "#D2A94F",
      text: "#F5F1E8",
      muted: "#9FC4B2",
    },
  },
  {
    id: "monetize-theme-page",
    num: "04",
    title: "Monetizing Your Existing Theme Page",
    subtitle: "Turn Your Followers Into Income, Whatever Your Page Size",
    href: "#",
    effect: "grid",
    fontDisplay: '"Poppins", "Inter", sans-serif',
    cover: null,
    colors: {
      bgTop: "#3A1226",
      bgBottom: "#160A11",
      tile: "#4A2233",
      accent: "#D9A93C",
      text: "#F6F1E6",
      muted: "#B896A5",
    },
  },
];
