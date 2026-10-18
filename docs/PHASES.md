# PHASES.md: Build plan, Thursday Oct 15 → Sunday Oct 18, 2026

> Agents: find the **current phase**, work only on its tasks, and meet its exit criteria before moving on. Humans: the **R4 Story and proof lead** is the scope referee; changes to this plan go through them.

## 1. Timeline at a glance (Arizona time)

| Phase | Window | Goal | Exit gate |
|---|---|---|---|
| 0 Setup and spikes | Thu 5 PM – 10 PM | Accounts, repo, first deploy, three risky spikes proven | Public URL live; map, image edit and push each work once |
| 1 Foundation and design system | Thu 10 PM – Fri 11 AM | Tokens, layout, header/footer, UI kit, content loaders | Shell pages render at all breakpoints; content validated |
| 2 Rebate engine and Studio | Fri 9 AM – Fri 6 PM | Engine + tests; quick estimate; studio (manual, sample, map) | All §7.5 tests green; studio works end to end |
| 3 Visualizer | Fri 11 AM – Fri 9 PM | Upload → render → slider, with fallbacks | Real render on a phone; fallback with provider off |
| 4 Content pages | Fri 2 PM – Sat 12 PM | Home, rebates, styles, plants, process, pricing, guides, legal | ≥ 18 live routes with final copy |
| 5 Conversion and live | Sat 9 AM – Sat 2 PM | Eligibility, booking + push, confirmation, analytics, /live | Booking buzzes the phone; /live counts update |
| 6 Proof and SEO | Sat 11 AM – Sat 3 PM | Proof drawer, launch notes, timeline, OG, sitemap, JSON-LD | Share previews render; Proof drawer populated |
| 7 Craft, testing, hardening | Sat 12 PM – Sat 11 PM | User tests, a11y, performance, states audit, demo mode, video | All `HACKATHON.md` §4 targets met or documented |
| 8 Freeze, submit, pitch | Sun 9 AM – 1:30 PM | Fixes only, submit 11:30, pitch 12:15 | Submitted; pitch delivered |

Saturday 9–10 AM is kickoff and on-site sessions; plan around them. Everyone tests on their own phone at each checkpoint: **Sat 9:00, 12:30, 3:30, 5:00, 9:00 PM; Sun 9:00, 10:30**.

Pre-weekend work is allowed ("existing projects welcome") but must be described honestly in the submission. Keep dated commits; the bulk of visible pages ships on the weekend.

## 2. Roles

| Role | Person | Owns | Axis |
|---|---|---|---|
| **R1 Experience lead** | ________ | Design system, layouts, home, all page UI, Craft pass, OG images | Design, Craft |
| **R2 Engine engineer** | ________ | Rebate engine, pricing, water, studio (map + results), eligibility, booking UI, slots | Receipts (features) |
| **R3 Platform and AI engineer** | ________ | Repo, deploy, DB, APIs, visualizer, notifications, /live, SEO plumbing, CI, demo mode | Receipts, Craft |
| **R4 Story and proof lead** | ________ | Content, guides, sample photos, Proof/launch notes, user testing, submission, pitch, organizer questions; scope referee | Receipts, Design |

Each person runs their own coding agent on their own branch. Merge to `main` through PRs with green checks.

---

## Phase 0: Setup and spikes (Thu 5 PM – 10 PM)

| ID | Task | Owner | SRS | Done when |
|---|---|---|---|---|
| P0-01 | Create GitHub repo `sonoran-swap`; add these docs and `content/` seed files; protect `main` | R3 | — | Repo exists; docs committed |
| P0-02 | Scaffold Next.js (App Router, TS strict, Tailwind, ESLint, Prettier, pnpm); add shadcn/ui; add Vitest + Playwright | R3 | ARCH §1 | `pnpm dev`, `pnpm test`, `pnpm e2e` run |
| P0-03 | Vercel project + production deploy of a placeholder page; **disable deployment protection on production** | R3 | R2 rule | Public URL opens in a private window |
| P0-04 | Claim a clean free URL (rename the Vercel project to `sonoran-swap` or similar). Custom domain only if one is free to the team | R4 | RC1 | `https://<name>.vercel.app` live |
| P0-05 | Neon Postgres **Free plan** via Vercel Marketplace; Drizzle schema skeleton; first migration | R3 | SRS §13 | Tables exist |
| P0-06 | **Spike: free image edit.** Take one lawn photo; run the base prompt (SRS §10.1) through (a) a free Google AI Studio key with billing off and (b) Cloudflare Workers AI's free allocation if it offers an image-to-image model. Time each; save results | R3 | FR-VIS | One passes (≤ 25 s, convincing, no card) → live mode. Neither → `IMAGE_PROVIDER=gallery` |
| P0-07 | **Spike: map.** Mapbox account via "Start without a credit card"; satellite map + draw + turf area on a test page; verify a known rectangle's area | R2 | FR-EST-03/04/05 | Area within ±3% |
| P0-08 | **Spike: push.** ntfy topic; phone subscribed; POST from a route handler | R3 | FR-NOTIF-01 | Phone buzzes |
| P0-09 | `lib/env.ts` (Zod), `.env.example`, Vercel env vars set | R3 | ARCH §7 | Build fails clearly on missing env |
| P0-10 | Content schemas + loaders; seed JSON validates | R2 | FR-REB-01 | `pnpm build` validates content |
| P0-11 | Post organizer questions in Discord (HACKATHON §8) | R4 | — | Posted; answers logged in HACKATHON.md |
| P0-12 | Photograph 3 sample lawns (team-owned or public-park lawns; no people, house numbers or plates); pick the hero sample | R4 | §19 item 6 | 3 photos in `public/samples/` |
| P0-13 | CI workflow (typecheck, lint, unit, build, secret-name grep) | R3 | ARCH §8 | PR checks run |
| P0-14 | **$0 check:** confirm no account (Vercel, Neon, Mapbox, Google AI Studio, Cloudflare, GitHub) has a payment method; note each free limit in ARCH §10 | R3 | NFR-COST-01 | All billing pages show no card |

**Exit:** public URL, three spikes pass, $0 check done. If no free image provider passes by 10 PM, run the visualizer in gallery mode (FR-VIS-12 as primary) and tell the team.

---

## Phase 1: Foundation and design system (Thu 10 PM – Fri 11 AM)

| ID | Task | Owner | SRS / doc |
|---|---|---|---|
| P1-01 | Tokens as CSS variables + Tailwind theme; Fraunces + Inter via `next/font` | R1 | DESIGN §2–3 |
| P1-02 | Restyle UI kit: button, input, select, segmented control, card, accordion, sheet/drawer, tabs, toast, badge, skeleton | R1 | DESIGN §6 |
| P1-03 | Root layout: skip link, Header (sticky, shrink), mobile menu sheet, Footer with disclosure, ConceptBadge, Breadcrumbs | R1 | SRS §5.2, FR-DISC |
| P1-04 | Shared components: Money, Sqft, SourceNote, Disclaimer, AiLabel, Stat, NotesList | R1 | DESIGN §6 |
| P1-05 | `not-found.tsx` and `error.tsx` per copy | R1 | FR-404 |
| P1-06 | Metadata helper, `sitemap.ts`, `robots.ts`, `manifest.ts`, favicon set | R3 | FR-SEO-01/02/05 |
| P1-07 | API envelope helper, rate limit helper, IP hashing | R3 | SRS §14 |
| P1-08 | Route stubs for all §5.1 pages with H1 and breadcrumbs | R1 | SRS §5.1 |

**Exit:** every route renders a styled shell at 375/768/1440 with no console errors; Lighthouse ≥ 95 on the shell home.

---

## Phase 2: Rebate engine and Studio (Fri 9 AM – 6 PM)

| ID | Task | Owner | SRS |
|---|---|---|---|
| P2-01 | `lib/rebates/engine.ts` with all four programs | R2 | §7.2–7.4 |
| P2-02 | Unit tests for every §7.5 case (plus property test: Phoenix amount = 2 × sqft for 250–20,000) | R2 | §7.5 |
| P2-03 | `lib/estimate/pricing.ts`, `water.ts`, `area.ts` + tests | R2 | §3.4–3.5 |
| P2-04 | QuickEstimate component (home hero strip) | R2 + R1 | FR-HOME-02 |
| P2-05 | Studio page: three entry paths; manual and sample paths | R2 | FR-EST-01/07 |
| P2-06 | Results panel with notes, tiers, ranges, water, timeline, actions | R2 + R1 | FR-EST-09/10/11, FR-REB-10–15 |
| P2-07 | Map: geocoder (browser-only), satellite, fly-to, draw/edit/delete/undo, live area, sanity checks, failure card | R2 | FR-EST-02–06/13/16 |
| P2-08 | Utility-city select and non-program cities | R2 | FR-EST-08 |
| P2-09 | `POST /api/estimates` (server recompute, DB insert) | R3 | §14 |
| P2-10 | Mobile stepper + docked results | R1 + R2 | FR-EST-15 |
| P2-11 | Copy link with query params | R2 | §4.7 |
| P2-12 | Playwright: sample path, manual path, map draw (fixture), no address in requests | R2 | §8 AC |

**Exit:** a stranger on a phone gets a correct rebate via all three paths; tests green.

---

## Phase 3: Visualizer (Fri 11 AM – 9 PM)

| ID | Task | Owner | SRS |
|---|---|---|---|
| P3-01 | Provider adapter (`gallery`, `gemini`, `cloudflare`, `mock`), prompt builder from `styles.json`, `RENDER_DAILY_CAP` below the free quota | R3 | FR-VIS-05, ARCH §6 |
| P3-02 | `POST /api/render`: validation, size limit, rate limit, daily cap, timeout, error mapping, metadata insert | R3 | §14, FR-VIS-06/13/16 |
| P3-03 | Upload zone + camera capture + client preprocessing (orientation, resize, EXIF strip, HEIC handling) | R3 | FR-VIS-01/02 |
| P3-04 | Style picker, staged progress, cancel | R1 + R3 | FR-VIS-03/04 |
| P3-05 | Compare slider (pointer + keyboard + ARIA) and Before/After/Compare toggle | R1 | FR-VIS-07 |
| P3-06 | Plant palette panel, CTAs, AI label | R1 | FR-VIS-08/09 |
| P3-07 | Pre-render the 3 sample photos × 3 styles for free (consumer AI apps with image editing, spread across team accounts, using the SRS §10.1 prompt); store in `public/samples/`; wire the gallery provider. **Saturday 8 AM:** photograph a lawn near the venue and pre-render it for the pitch | R4 + R3 | FR-VIS-12 |
| P3-08 | Download before/after composite | R3 | FR-VIS-14 (S) |
| P3-09 | Playwright with mock provider; manual test on iOS and Android | R3 | §5 tests |

**Exit:** live mode: a real photo becomes a convincing render on a phone in ≤ 25 s. Gallery mode: every style shows a labeled result instantly. Either way, the fallback label is correct.

---

## Phase 4: Content pages (Fri 2 PM – Sat 12 PM)

| ID | Task | Owner | SRS |
|---|---|---|---|
| P4-01 | Home: all sections FR-HOME-01 – 12, hero slider using sample render, A/B headline via `?v=` | R1 | §6.1 |
| P4-02 | Rebates hub and city template; Phoenix, Mesa, Chandler, Scottsdale pages; worked examples from the engine | R1 + R4 | §6.6–6.7 |
| P4-03 | Styles overview and three style pages | R1 + R4 | §6.8 |
| P4-04 | Plants page with filters and empty state | R1 | §6.9 |
| P4-05 | How it works, Pricing (engine-driven example), FAQ JSON-LD | R1 | §6.10–6.11 |
| P4-06 | Three MDX guides from CONTENT §10 with sources | R4 | §6.12 |
| P4-07 | Privacy and Accessibility statements | R4 | §6.16, §15.8 |
| P4-08 | Copy review pass against CONTENT.md; no placeholders | R4 | C11 |
| P4-09 | **Friday:** verify the production URL in Google Search Console (free) and submit `sitemap.xml`; record `submittedAt` in `content/seo-report.json` | R4 | FR-INS-08, RC12 |

**Exit:** ≥ 18 live routes with final copy; route audit table in /launch-notes updated.

---

## Phase 5: Conversion and live (Sat 9 AM – 2 PM)

| ID | Task | Owner | SRS |
|---|---|---|---|
| P5-01 | Eligibility flow from JSON question sets; results; `POST /api/eligibility` | R2 | §9 |
| P5-02 | Slots generator (deterministic unavailability) + tests | R2 | FR-BOOK-03 |
| P5-03 | Booking page, idempotency, `POST /api/bookings`, ntfy push, notified flag | R2 + R3 | §11.1–11.2 |
| P5-04 | Confirmation page with notify preview card and .ics | R2 | FR-BOOK-05, FR-NOTIF-03 |
| P5-05 | Events beacon + whitelist + `POST /api/events` | R3 | FR-ANL-02/03 |
| P5-06 | `GET /api/stats` aggregates; `/live` board with QR, counters, bars, ticker, stale indicator | R3 | §11.3 |
| P5-07 | Test-session capture (`?t=`), first-estimate timing | R3 | FR-ANL-04 |
| P5-08 | Source tagging (`?src=`/`utm_source`, referrer fallback, URL cleanup), `cta_impression`, `page_view` into `events`, team-session exclusion | R3 | FR-ANL-05–07, FR-INS-13 |

**Exit:** booking from a phone buzzes the crew phone within 5 s; /live shows the booking and estimate counts.

---

## Phase 6: Proof and SEO (Sat 11 AM – 3 PM)

| ID | Task | Owner | SRS |
|---|---|---|---|
| P6-01 | `scripts/timeline.ts` + committed `content/timeline.json` | R3 | FR-PROOF-02, AGENTS §6 |
| P6-02 | Proof drawer with all tabs; `/launch-notes` long form + about + limits + feedback form | R1 + R4 | §11.4–11.5 |
| P6-03 | Dynamic OG images per page; verify in iMessage, LinkedIn, Slack, X | R3 | FR-SEO-04, C12 |
| P6-04 | JSON-LD (WebSite, WebPage, Breadcrumb, FAQPage, Article); validate | R3 | FR-SEO-03 |
| P6-05 | Save first Lighthouse/PageSpeed reports to `public/reports/` with dates | R4 | RC7 |
| P6-06 | Prep sheet page and print stylesheet | R2 | §6.3 |
| P6-07 | `/insights` page and `GET /api/insights`: funnel, CTR, A/B, sources, audience, feature health, SEO readiness, decisions log, KPI explainer; small-number honesty | R3 + R1 | FR-INS-01–12 |
| P6-08 | `scripts/seo-report.ts` (route metadata coverage at build) and `content/decisions.json` seeded empty | R3 + R4 | FR-INS-08/09 |
| P6-09 | Generate tagged links and QR codes for every channel (§11.9); team members use `?team=1` on their own devices | R4 | RC12 |

**Exit:** share previews pass 4/4; Proof drawer shows live timeline, quality and testing tabs.

---

## Phase 7: Craft, testing and hardening (Sat 12 PM – 11 PM)

| ID | Task | Owner | Target |
|---|---|---|---|
| P7-01 | **User testing round 1** (12:30–1:30 PM): 5–8 attendees via `?src=test&t=Txx&v=a|b`, five-second test, time to first rebate; permission for quotes | R4 | D1, D4, RC5 |
| P7-02 | Fix the top 5 issues from round 1, **reading the /insights funnel to find the biggest drop-off**; log each change in `content/decisions.json` (observation, evidence, change) | All | RC11 |
| P7-03 | **Craft pass** (3:30–4:30 PM): every page at 320/375/768/1024/1440; spacing, type, states (SRS §12), copy | R1 | C5, C8, C11 |
| P7-04 | Accessibility: axe on key pages; keyboard walkthrough; screen-reader spot check | R1 + R3 | C7, C10 |
| P7-05 | Performance: Lighthouse mobile ≥ 95 ×4 on home, /studio, /rebates/phoenix; fix LCP/CLS | R3 | C1–C4 |
| P7-06 | **User testing round 2** (4:30 PM): 5+ testers; publish results; add the measured `result` to each decision entry | R4 | RC5, RC11 |
| P7-07 | Demo mode `?demo=1` (mocks + seeded data); test with Wi-Fi off after load | R3 | NFR-REL-02 |
| P7-08 | Production deploy; private-window test on two phones | R3 | R2 rule |
| P7-09 | Record 45–60 s demo video; before/after screenshots (Friday vs Saturday) | R4 | RC8, RC9 |
| P7-10 | Create the submission **draft** on the Ship AI form; fill fields from HACKATHON §6 | R4 | R10 |
| P7-11 | Rehearse the pitch 5× with live demo and the fallback path | R4 + all | — |

**Exit:** every target in `HACKATHON.md` §4 met or the miss documented in Limits.

---

## Phase 8: Freeze, submit, pitch (Sun 9 AM – 1:30 PM)

| Time | Task | Owner |
|---|---|---|
| 9:00 | Checkpoint; bug fixes and copy only | All |
| 10:30 | **Code freeze.** Final production deploy. `pnpm timeline` committed before freeze | R3 |
| 10:30–11:15 | Final Lighthouse reports saved; Proof numbers refreshed; pre-submission checklist (HACKATHON §9) | R4 + R1 |
| 11:15 | Reset `LIVE_SINCE` to 12:00 PM for the pitch counters | R3 |
| **11:30** | **Submit** (fields from HACKATHON §6); screenshot confirmation | R4 |
| 11:30–12:10 | Two full rehearsals; phones charged; QR printed; video on two devices | All |
| 12:15 | Recorded pitch (script: CONTENT §11) | R4 speaks, R2 drives demo |
| 1:30 | Awards; network with employers | All |

---

## 3. Cut order (if behind schedule)
Cut in this order; never cut what's in **bold** below.
1. Spanish (not planned) and "See it in July" (FR-VIS-15)
2. Download composite (FR-VIS-14)
3. Plants filters (keep a static list)
4. Third guide, then second guide
5. Scottsdale page (keep status in the hub)
6. Prep sheet page
7. /live board (keep counters in the Proof drawer)

**Never cut:** studio (all three paths), rebate engine and tests, visualizer with fallback, eligibility, booking with notification, home, the four city entries in the hub, disclosures, Proof drawer and launch notes, mobile polish.

## 4. Parking lot (ideas not in scope; do not build without referee approval)
- Partner mode with a real landscaper's data
- Spanish translation
- Shade-tree heat-reduction visual
- HOA letter generator
- Monsoon drainage (dry creek bed) visual planner
