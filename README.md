# Beyond the Crease

**Every match has a story. Not every story gets heard.**

A frontend-only prototype for the ICC Global Hackathon, Track 1 — *Sport Visibility &
Engagement*. It amplifies women athletes through AI-style storytelling, a visibility-parity
tracker, and inclusive multilingual fan communities.

Cricket-first, cross-sport ready. All athletes, teams, statistics, quotations and events are
fictional.

```bash
npm install
npm run dev        # vite dev server
npm run build      # typecheck + production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint, zero warnings allowed
npm run preview    # serve the production build
```

No backend, no API keys, no external AI service. The whole app runs in the browser.

---

## What it does

| Area | Route | What is actually implemented |
| --- | --- | --- |
| Landing | `/` | "The Pavilion Gate" — hero, gate transition, live ticker, parity teaser (see below) |
| Today | `/today` | Hero, live ticker, featured rail, story feed with filters and pagination, scouting badges |
| Live | `/live` | Live and completed matches, ball-by-ball moments, webhook-driven ticker, fire-test event |
| Match | `/match/:id` | Score, win probability, timeline, stories from this match, related moments |
| Athletes | `/athletes` | Search, team, language and sort filters across 24 cricketers |
| Athlete | `/athlete/:id` | Career arc, visibility share, statistics, follow, alerts, stories |
| Studio | `/studio` | Template story generator, live fairness scoring, one-click fixes, drafts, publish, PNG share card |
| Parity | `/parity` | Broadcast/mention/clip/sponsor share, monthly chart, platform split, regional heat, projection, CSV |
| Circles | `/circles` | Eight moderated fan rooms, filters, join/leave |
| Circle | `/circle/:id` | Threaded chat with machine translation, reactions, reports, blocks, mutes, RSVP, house rules |
| Access | `/access` | Text size, dyslexia font, contrast, motion, low data, keyboard map, moderation and fairness logs |
| Story | `/story/:id` | Full story, per-story translations, fairness explainer, related stories, report action |
| About | `/about` | Product thesis, dataset summary, how the fairness engine works |
| Partners | `/partners` | Three partnership tracks, demo enquiry form with validation |
| Dev | `/dev` | Every API route, webhook simulation and delivery log, fairness rules, persisted-store controls |
| Design | `/design` | Mithai Dusk tokens read live from the stylesheet, type scale, motifs, component previews |
| 404 | `*` | Accessible not-found page with recovery links |

---

## Landing page — "The Pavilion Gate"

`/` is a light, lazily loaded marketing route (`src/pages/Landing.tsx` +
`src/features/landing/`). The former Home moved to `/today`; every nav item, logo link,
breadcrumb, command-palette entry and 404 suggestion follows it.

- **Own theme, no side effects.** The page sets `data-theme="dusk"` on mount and restores the
  visitor's saved theme on unmount — the stored preference is never touched.
- **Structure.** Hero → live ticker (marquee with pause, reduced-motion aware) → visibility
  gap (paired bars + count-up) → how it works → tone playground (four tones + fairness fix) →
  parity teaser (24-month SVG lines + gap-closer slider) → circles & languages (join buttons,
  six-language grid that re-renders the page live) → cross-sport picker (story feed swaps per
  sport) → final CTA. Every control navigates, mutates a store, opens a modal or calls the
  mock API; the primary CTA always leads to `/today`.
- **The gate.** Choosing *Enter the Pavilion* closes two aubergine doors over the page, flips
  `prefs.hasEntered`, restores the theme, then opens them again over `/today` — with an
  aria-live announcement, a hover/focus prefetch of the Today bundle, and a fade-only path
  under `prefers-reduced-motion`.
- **Data is real app data.** Ticker, gap, parity and circles sections go through the same
  `api` layer (MSW now, real endpoints later), so their loading, empty and error states are
  genuine.
- **Skip control.** The hero offers "Skip the intro next time" and `/access` can re-enable the
  landing page. Sport chips pre-seed onboarding, which then skips its sport step.
- **Light by design.** One route-level lazy chunk (~8 kB gzip), no video, no new libraries —
  only React, framer-motion and react-i18next, which the app already ships.

### How the landing maps to Track 1

| Goal | Where it shows up on the landing page |
| --- | --- |
| Sport visibility | Visibility-gap bars, parity lines and KPIs are the page's centrepiece, with a demo-data note |
| Fan engagement | Live ticker, tone playground, join buttons, and CTAs into Studio, Parity, Circles |
| Inclusive community | Six-language grid (Arabic RTL), moderated-circle cards, access mentions |
| Storytelling | Headline-to-feed narrative, 60-second tour modal, per-sport story previews |
| Craft & access | Curtain entrance that settles static, WCAG AA dusk contrast, keyboard + reduced-motion support |

---

## Architecture

```
src/
  api/         client, resolvers, storyEngine, fairness lives next to the data it checks
  components/  layout (header, footer, onboarding, command palette), ui primitives,
               match, story, circle, athlete surfaces
  data/        fictional datasets + deterministic cross-sport generation
  hooks/       useAsync, useFeed, useClipboard, useCountUp, useLiveSimulation, useWebhook
  i18n/        six languages, Arabic RTL
  mocks/       MSW handlers generated from the resolver route table
  pages/       one file per route
  store/       persisted zustand slices (prefs, gamification, studio, notifications, safety, toasts)
  styles/      CSS variables, paper grain, jaali lattice, motion and contrast rules
  types/       shared domain types
  webhooks/    event bus, delivery log, retries, simulation
  utils/       formatting, contrast, fairness, ids, class merging
```

### One resolver implementation, two transports

`src/api/resolvers.ts` is the single source of truth for every endpoint. It is exposed two
ways:

1. **MSW over HTTP** — `src/mocks/handlers.ts` is generated from the same route table, so the
   app makes real `fetch` calls with real status codes.
2. **In-process fallback** — if the service worker is unavailable (first load, blocked, or a
   hard refresh in an odd state), `src/api/client.ts` calls the resolver directly.

Requests carry a simulated 300–900ms latency and a 5% failure rate in both transports, so
loading, empty and error states are reachable by hand on every screen.

Swapping to a real backend means deleting the MSW layer and pointing `src/api/client.ts` at
your host. No page or component changes.

### Webhooks

Four event types drive the live surface: `match.moment`, `story.published`, `circle.message`,
`milestone.reached`. They are emitted by real user actions (enabling match alerts, publishing
from the Studio, posting in a circle) and by the simulation on `/live` and the home ticker.
Every delivery is logged with latency and outcome at `/dev`.

### The fairness engine

The Studio is the point of the exercise, not a toy. `checkFairness` scores body copy on every
keystroke and flags diminishing phrasing; `applyFairnessFixes` rewrites the flagged phrases so
the copy describes the work rather than the body. The same function scores the 40 hand-written
stories in the dataset. It is not a proof of anything — it is a prompt to read the copy again
before it ships.

The generator is seeded, so the same inputs always produce the same draft. That makes a demo
run reproducible, and it is why no external model is called.

---

## Design system — Mithai Dusk

An Indian sweet-shop counter at golden hour: pistachio barfi, rose sweets, saffron, and silver
varq foil against a deep aubergine dusk.

| Role | Name | Variable |
| --- | --- | --- |
| Ink / dark surfaces | Aubergine Ink | `--btc-ink` |
| Base canvas | Kulfi Cream | `--btc-canvas` |
| Primary CTA | Pomelo Flame | `--btc-pomelo` |
| Highlights, live, stars | Kesar Gold | `--btc-kesar` |
| Positive / success | Pistachio Barfi | `--btc-pistachio` |
| Soft cards | Rasmalai Rose | `--btc-rose` |
| Depth / secondary | Mulberry Wine | `--btc-mulberry` |
| Borders, shimmer | Varq Silver | `--btc-silver` |

Tokens live in `tailwind.config.js` and CSS variables. No component hardcodes a hex — the
`/design` page reads its values back out of the stylesheet with `getComputedStyle`, so the
reference cannot drift from the implementation.

Type: Fraunces for display, Bricolage Grotesque for body, Atkinson Hyperlegible as the
dyslexia-friendly fallback.

Motifs: scalloped card edges, jaali lattice, paper grain, sticker badges, silver hairlines,
`dusk-fruit` and `barfi-glow` gradients. Proportions are roughly 60% kulfi or aubergine, 30%
rose and mulberry, 10% pomelo, kesar and pistachio. Aubergine text sits on pomelo and kesar
buttons, never the reverse — cream on gold fails AA.

Two themes (Kulfi Cream, Aubergine Dusk), both checked for contrast.

---

## Accessibility

- WCAG AA contrast in both themes; `/access` shows the computed ratio for the current pairing.
- Every control is reachable and operable by keyboard, with a visible focus ring.
- Skip link, landmarks, `aria-live` for toasts and live updates, labelled toggles, and pressed
  states on toggle buttons.
- Six languages including Arabic with RTL layout, and per-story translations in the circle
  threads.
- Text scaling to 140%, dyslexia-friendly font, high contrast, reduced motion, and a low-data
  mode that drops animations and simplifies charts to tables.
- Loading, empty and error states everywhere. The parity chart has a table fallback and a
  no-animation mode.

---

## Demo data

Everything is invented. 24 cricketers, 12 matches, 40 hand-written stories, eight fan circles,
a deterministic 24-month visibility dataset, and cross-sport data for football, tennis, hockey
and athletics generated from shared shapes. Visibility figures are illustrative and are not
derived from any real broadcast, sponsor or social dataset.

Team crests, athlete portraits and venue imagery are abstract motifs rather than likenesses or
logos. Tagline and hashtags: **#BeyondTheCrease**
