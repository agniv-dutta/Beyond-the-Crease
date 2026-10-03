# Beyond the Crease — Agent Rules

You are building **Beyond the Crease**, a frontend-only hackathon prototype for the
**ICC Global Hackathon Track 1: "Sport Visibility & Engagement"**. It amplifies women athletes
via AI-style storytelling, a visibility-parity tracker, and inclusive multilingual fan communities.
Cricket-first, cross-sport ready.

## RULES

- **Stack:** React 18 + Vite + TypeScript, Tailwind, React Router, Zustand, Framer Motion,
  Recharts, react-i18next, MSW, lucide-react, html-to-image.
- **NO real backend.** All data is realistic dummy data in `/src/data`. Fetch via an api layer
  (`/src/api`) intercepted by MSW so swapping to real endpoints later is trivial.
- **Every button, form, toggle, tab, modal, and link must DO something** (navigate, mutate store,
  show toast, open modal, or fire a mock webhook). No dead UI.
- **Use fictional athletes, teams, and numbers.** Never real people's names or likenesses. Add a
  small "Demo data" footer note.
- **Design tokens live in `tailwind.config` + CSS variables.** Never hardcode hex in components.
  Never use black, white, teal, cyan, or rust.
  Palette: ink `#2D1238`, canvas `#F2E6CF`, pomelo `#FF6F8E`, kesar `#F2B33D`,
  pistachio `#A9CC6B`, rose `#F4A6B7`, mulberry `#6E1F4B`, silver `#CFD2DA`.
- **Fonts:** Fraunces (display), Bricolage Grotesque (body).
- **Accessibility:** WCAG AA contrast, keyboard navigation, visible focus rings, aria labels,
  reduced-motion support.
- **Responsive, mobile-first.** Components small, typed, and reusable. Loading, empty, and error
  states everywhere.
- **Commit-sized changes; explain what you changed after each step.**

## Design system — "Mithai Dusk"

An Indian sweet-shop counter at golden hour: pistachio barfi, rose sweets, saffron, and silver
varq foil against a deep aubergine dusk.

| Role                    | Name             | Hex       |
| ----------------------- | ---------------- | --------- |
| Ink / dark surfaces     | Aubergine Ink    | `#2D1238` |
| Base canvas             | Kulfi Cream      | `#F2E6CF` |
| Primary CTA             | Pomelo Flame     | `#FF6F8E` |
| Highlights, live, stars | Kesar Gold       | `#F2B33D` |
| Positive / success      | Pistachio Barfi  | `#A9CC6B` |
| Soft cards              | Rasmalai Rose    | `#F4A6B7` |
| Depth / secondary       | Mulberry Wine    | `#6E1F4B` |
| Borders, shimmer        | Varq Silver      | `#CFD2DA` |

- **Gradients:** `dusk-fruit` (pomelo → kesar), `barfi-glow` (pistachio → canvas).
- **Proportions:** ~60% Kulfi or Aubergine, 30% Rose and Mulberry, 10% Pomelo, Kesar, Pistachio.
- **Motifs:** scalloped card edges, faint jaali lattice, soft paper grain, sticker-style badges,
  silver hairline borders.
- **Contrast:** aubergine text on pomelo and kesar buttons, never on kulfi.

## Brand

- Wordmark: **Beyond the Crease** (`BTC` monogram in a scalloped gold roundel).
- Tagline: *"Every match has a story. Not every story gets heard."*
- Hashtag: `#BeyondTheCrease`

## Routes

`/` Landing ("The Pavilion Gate") · `/today` Home · `/live` · `/match/:id` · `/story/:id` ·
`/athletes` · `/athlete/:id` · `/studio` · `/parity` · `/circles` · `/circle/:id` · `/access` ·
`/about` · `/partners` · `/dev` · `/design` · `*` 404

## Commands

```bash
npm install
npm run dev        # vite dev server
npm run build      # typecheck + production build
npm run typecheck  # tsc --noEmit
npm run preview
```

## Landing Page Rules

- Add a landing page at "/" called "The Pavilion Gate". The existing Home moves to "/today". Update every internal link, nav item, logo link, and redirect accordingly.
- Reuse the existing design tokens and primitives only (ink #2D1238, canvas #F2E6CF, pomelo #FF6F8E, kesar #F2B33D, pistachio #A9CC6B, rose #F4A6B7, mulberry #6E1F4B, silver #CFD2DA; Fraunces + Bricolage Grotesque). Never use black, white, teal, cyan, rust, or generic SaaS blue/indigo gradients.
- The landing page uses the "dusk" theme by default (aubergine ground, cream text), independent of the user's saved theme, and must not overwrite it.
- Every button, link, and interactive element must work. The primary CTA always leads to /today.
- Respect prefers-reduced-motion (replace animations with fades), keep WCAG AA contrast, and support keyboard navigation with visible focus rings.
- Reuse the mock API, webhook hook, i18n and store. No new backend. Keep fictional athletes and the "Demo data" note.
- Lazy-load the landing route and keep it light: no autoplay video, no heavy libraries beyond what the project already uses.
