# Changelog

All notable changes to this project. Dates are the day the work landed on `main`.

## [2.0.0] — 2026-09-13

Rebuilt for the Thailand Game Show business card (the QR points at the root URL).

### Scene: the moon library

- New room (`tools/gen_library.py`, layered: exterior view → floor/walls/window frame →
  objects → labels). Arcade wing (4 cabinets, west), library (6 book sets, east),
  reception desk (south). Porings, fairies, dragon, rune ring and cave foreground removed.
- Objects map to the old content zones via `chapters`; nothing was dropped. Zones with
  several chapters (Content & Community, Languages & Skills, Writing & Esports) get a
  tab strip in the panel.
- Quick menu (☰ / `M`) reaches every section without walking.

### Front page

- Name, role line, primary "Explore" and secondary "Read the resume" buttons, three
  labelled language circles (TH / EN / JP). No forced language prompt or dialogue.
- Language priority: `?lang=` → saved choice → English.

### Content

- Single `GAMES` dataset (16 titles from Steam appdetails, EN + TH names) drives the
  cabinet carousel/grid and the Resume Mode list. 13 titles with Thai on Steam,
  1 translated awaiting release, 2 freelance. Adult titles are text cards until revealed.
- Facts aligned with the 2026-09-13 documents: manager role at Sticky Rice Games,
  15% uplift scoped to localized titles, DIGITAL HEARTS duties as documented, no
  "100% of bugs", network followers described as scale rather than reach.
- Reception panel: copyable contact, PDF documents (open + download), business card
  front/back at trim size with lightbox and PDF download.
- Documents refreshed: English resume, general-purpose 履歴書 and 職務経歴書 (no
  company-specific motivation, no tool brand names).

### Theme

- New stylesheet: purple surfaces, dull-gold accents, off-white text, shared spacing /
  radius / shadow tokens. Showcase slides regenerated to match.

## [1.0.0] — 2026-07-25

First tagged release. The site has been live at
[gatipnw.github.io](https://gatipnw.github.io/) since 2026-07-20.

### The game

- Top-down explorable studio room with **14 interactive zones**, each opening a
  washi-paper panel of work: game localization, LQA, YouTube, events, esports,
  fiction writing, industry network, education, contact, resume downloads.
- Cinematic intro — the mascot ("Kratib") charges through the logo, you pick a
  language, then fly into the moon where the studio lives.
- HD-2D presentation: painted room render, additive bloom, tilt-shift limited to
  the bottom edge, moonbeams from three windows, a dragon passing behind them.
- Living details: five Poring-style creatures that hop without clipping through
  furniture, fairies that flee the player, drifting light motes, a rotating rune ring.

### Languages and accessibility

- **Full TH / EN / JA localization.** Every string is data in `js/data/content.js`;
  switching from the HUD re-renders open panels without a reload and is remembered
  in `localStorage`.
- The Japanese resume follows real 職務経歴書 section order rather than a translation
  of the English CV — section grouping is per-locale data.
- **Resume Mode**: plain scrolling HTML reachable from the title screen, screen
  reader friendly, with a `@media print` block so Ctrl+P yields a clean PDF.
- `prefers-reduced-motion` respected throughout, with an opt-in ✨ FULL FX toggle.

### Controls

- Desktop: WASD / arrows, <kbd>E</kbd> to interact, <kbd>Esc</kbd> to close.
- Click-to-walk with a ripple effect; clicking an object walks there and opens it.
  Right-click stops movement and interacts, without the browser context menu.
- Touch: floating analog stick that follows the touch point, plus a ✦ interact
  button that appears near objects. Tested down to 360 px wide.

### Performance

- Single `requestAnimationFrame` loop with delta time; stops when the tab is hidden.
- `renderer.draw` measured at **1.2 ms median / 2.1 ms p95** per frame.
- No `ctx.shadowBlur` in the draw loop, no per-frame gradients or allocations —
  everything glow-shaped is a pre-rendered sprite.

### Tooling

- Python generators (numpy + pillow, fixed seeds) for the night sky, the room
  render at 3×, the north wall strip at 4×, sprites, the standardised 24-logo set
  and all 38 showcase slides at 2560×1440.
- CDP-driven test scripts covering every panel in all three languages, the mobile
  layouts, control bugs, wall collision, load order and frame timing.

### Sharing

- Real `<title>`, description, Open Graph and Twitter card tags in the served HTML
  so link previews work — crawlers never run the JS that used to set them.
- Generated 1200×630 share image.

[1.0.0]: https://github.com/GatipNW/GatipNW.github.io/releases/tag/v1.0.0
