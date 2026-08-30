// ============================================
// BUSINESS FOUNDERS: Founder Series themes
// One entry per book. js/books.js renders a card
// from each entry; tweak colours here only.
// ============================================

const BOOK_THEMES = [
  {
    id: "grow-theme-page",
    num: "01",
    title: "How to Grow a Theme Page From Scratch",
    subtitle: "A Beginner's Guide to Building a US Audience",
    href: "book-01.html",
    cover: { webp: "images/covers/book-1-grow-theme-page.webp", png: "images/covers/book-1-grow-theme-page.png" },
    price: "$14",
    priceWas: "$19",
    chapterPdf: "files/chapter-01.pdf",
    effect: "shelf",
    fontDisplay: '"Lora", Georgia, serif',
    colors: {
      bgTop: "#1B3C58",
      bgBottom: "#0E2334",
      accent: "#C9A24C",
      text: "#F4EFE4",
      muted: "#C9BFAC",
    },
  },
  {
    id: "monetize-theme-page",
    num: "02",
    title: "Monetizing Your Existing Theme Page",
    subtitle: "Turn Your Followers Into Income, Whatever Your Page Size",
    href: "book-02.html",
    cover: { webp: "images/covers/book-2-monetizing.webp", png: "images/covers/book-2-monetizing.png" },
    price: "$14",
    priceWas: "$19",
    chapterPdf: "files/chapter-02.pdf",
    effect: "grid",
    fontDisplay: '"Poppins", "Inter", sans-serif',
    colors: {
      bgTop: "#3A1226",
      bgBottom: "#160A11",
      tile: "#4A2233",
      accent: "#D9A93C",
      text: "#F6F1E6",
      muted: "#B896A5",
    },
  },
  {
    id: "launch-with-ai",
    num: "03",
    title: "How to Launch a Business With AI",
    subtitle: "A Solo Creator's Guide, From Idea to First Sale",
    href: "book-03.html",
    cover: { webp: "images/covers/book-3-launch-with-ai.webp", png: "images/covers/book-3-launch-with-ai.png" },
    price: "$14",
    priceWas: "$19",
    chapterPdf: "files/chapter-03.pdf",
    effect: "lift",
    fontDisplay: '"Poppins", "Inter", sans-serif',
    colors: {
      bgTop: "#ECF2FC",
      bgBottom: "#ECF2FC",
      accent: "#1B45D8",
      deep: "#1E3A8A",
      text: "#121A2B",
      // Spec palette said #78829B, but that's only 3.3:1 against the
      // light background, fails WCAG for body text. Darkened to pass 4.5:1.
      muted: "#586380",
    },
  },
  {
    id: "grow-with-ai",
    num: "04",
    title: "Growing Your Business With AI",
    subtitle: "Get More Customers and Revenue From What You Already Have",
    href: "book-04.html",
    cover: { webp: "images/covers/book-4-growing-with-ai.webp", png: "images/covers/book-4-growing-with-ai.png" },
    // The artwork deliberately leaves its middle band empty so this curve
    // can be drawn over it instead of printed into it. Coordinates are in
    // the cover's own 1800x2700 space, which is what js/books.js uses as
    // the overlay viewBox, so they hold at any rendered size.
    //
    // Measured off the export: the subtitle ends at y=1274 and the gold
    // caption block starts at y=2297. Nothing here may stray outside
    // roughly y=1400..2210, glow radius included, or it touches type.
    // Any other book can take a curve by adding this same block with its
    // own path and node.
    curve: {
      d: "M 90 2180 C 520 2168, 880 2090, 1160 1900 S 1545 1610, 1690 1480",
      node: { x: 1690, y: 1480, r: 45, glow: 120 },
    },
    price: "$14",
    priceWas: "$19",
    chapterPdf: "files/chapter-04.pdf",
    effect: "curve",
    fontDisplay: '"Poppins", "Inter", sans-serif',
    colors: {
      bgTop: "#175F45",
      bgBottom: "#062017",
      accent: "#D2A94F",
      text: "#F5F1E8",
      muted: "#9FC4B2",
    },
  },
];
