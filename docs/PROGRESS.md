# PROGRESS.md: Build status and handoff notes

> **Read this right after `HACKATHON.md` at the start of every session.** It records what is built, what was decided and why, and what is next, so a new session (or a teammate's agent) doesn't rebuild context from scratch. Update it at the end of every task: status table, decisions, open items. Keep it factual; dates in Arizona time.

Last updated: **Fri Oct 16, 2026, evening** (Phases 5–7 agent work merged through PR #31; reports/privacy PR in flight). Production: **https://sonoran-swap.vercel.app** (deploys from `main`). Human checks: `docs/MANUAL_CHECKS.md`. Submission drafts: `docs/SUBMISSION.md`.

## 1. Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 Setup and spikes | **Done** | All three spikes pass (map, push, image via Cloudflare). |
| 1 Foundation and design system | **Done** | PRs #3, #4. |
| 2 Rebate engine and Studio | **Done** (FR-EST-14 map snapshot shipped with P6-06, PR #24) | PR #5. Free map fallback (Photon + MapLibre/USGS) PR #15, decision 24. |
| 3 Visualizer | **Done** except the manual iOS/Android check in P3-09 (needs a phone) | PR #8. Live Cloudflare render verified locally end to end (10.1 s). |
| 4 Content pages | **Done** except P4-08 copy review (R4) and P4-09 Search Console (human) | PRs #10–#13. All `BuildingNote` shells have since been replaced (Phases 5–6). |
| 5 Conversion and live | **Done** in code (Fri Oct 16) | PRs #17 eligibility, #18 booking, #19 analytics, #20 live. Exit gate still needs a human: book from a phone on production and confirm the crew phone buzzes within 5 s, then see it on /live. |
| 6 Proof and SEO | **Done** (Fri Oct 16) | P1-06 route registry/sitemap/robots/manifest/icons; P6-01 `pnpm timeline`, P6-08 `pnpm seo-report` (runs in `pnpm build`); P6-02 Proof drawer + /launch-notes + feedback (PR #22); P6-03 OG images, P6-04 JSON-LD, llms.txt (PR #23); P6-06 prep sheet + FR-EST-14 map snapshot (PR #24); P6-07 /insights (PR #25); P6-09 tagged links + QR (PR #26). Manual checks now collected in `docs/MANUAL_CHECKS.md`. |
| 7 Craft, testing, hardening | **Agent work done** (Fri Oct 16) | P7-03 craft sweep (`pnpm shots`), P7-04 a11y (axe every route, keyboard journey, route focus), P7-05 performance (production medians: home 96, studio 94, rebates/phoenix 91; A11y/BP/SEO 100), P7-07 demo mode. Human parts (P7-01/02/06 user tests + decisions, P7-08 phones, P7-09 video, P7-10 draft, P7-11 rehearsal) are in `docs/MANUAL_CHECKS.md`. |
| 8 Freeze, submit, pitch | Not started | Submission is the team's (not agents'). |

### Task detail (done items only list what's non-obvious)
- **P7-05 performance:** production Lighthouse mobile after Phase 6 (Oct 16): home 86 (LCP = hero before-photo, 3.6 s simulated; JS 253 KB vs 170 KB on Oct 15, images 0 → 108 KB), studio 93, rebates/phoenix 97; Accessibility/Best Practices/SEO 100. Changes: AVIF first (`images.formats`; hero photo 54 → 29 KB), after-photo `fetchPriority="low"`, `lib/demo` split so the engine/content JSON isn't in every page's bundle, mobile menu and Proof drawer load their Radix Dialog on first open (focus is handed back manually since there's no Radix Trigger). Home first-load JS ≈ 180 KB gz.
- **P7-04 accessibility:** `tests/e2e/a11y.spec.ts` runs axe on every route (+ prep sheet) at both viewports (0 serious/critical) and a keyboard-only journey home → sample rebate → booking with a visible-focus check at each stop. Added `RouteFocus` (layout): on client navigation focus moves to `<main>` so Tab doesn't continue from the old page's position (found by that test). Radix roving focus moves on the next tick; tests wait with `toBeFocused()`.
- **P7-07 demo mode:** `lib/demo/flag.ts` (no imports; in every bundle) + `lib/demo/stats.ts` (/live only) + `components/demo/demo-mode.tsx`. `?demo=1` (per tab; `?demo=0` off) shows a "Demo mode" pill, marks analytics as team, sends `x-demo: 1` on render and booking (render → mock provider; booking skips the push and is honestly "Not delivered"), prefetches the key routes and sample images, and /live replays engine-priced sample numbers labeled "Demo replay: sample numbers, not real visits". Offline after load: studio sample path, eligibility and sample previews work; booking, map and live push need the network.
- **P6-09:** `pnpm links` writes `docs/LINKS.md` (channel links per SRS §11.9, 16 numbered tester links alternating A/B, team link) and printable `docs/qr/*.svg`. **Team flag deviates from FR-INS-13:** kept in `localStorage` (not `sessionStorage`) so new demo tabs stay excluded; `?team=0` clears it.
- **P6-07:** `GET /api/insights?range=launch|today|hour` (`launch` = `INSIGHTS_SINCE`, Sat 9 AM; before then it is empty by design), CDN 30 s. SQL in `lib/insights/queries.ts` (11 aggregate queries over `events`, `team = false`; median time to rebate = first `estimate_shown` − first `page_view` per session). Shaping and FR-INS-11 honesty (denominator < 10 → "n = x, too few to read") in `lib/insights/summary.ts`. Funnel steps aren't strictly nested (a visitor can see a rebate on the home quick estimate without `estimator_start`). "Previewed a yard" counts live renders, examples and sample yards. Added event `map_failed{engine}` for FR-INS-07. Five-second test reads `5s:pass`/`5s:fail` tokens in `test_sessions.notes`.
- **P6-06 / FR-EST-14:** `/studio/prep` reads `?city&sqft&tier` in the browser and renders the engine's estimate, notes, documents checklist, source and disclaimer; `window.print()` with a print stylesheet (header/footer `print:hidden`, breadcrumbs hidden). The map snapshot: `MapCanvasHandle.snapshot()` (JPEG data URL; `preserveDrawingBuffer` already on) registered via `lib/studio/snapshot.ts` while the map is open; the "Print prep sheet" link saves it to `sessionStorage.ss_prep_snapshot`. Typed/sample measurements print without a map and say so.
- **P6-03/04:** `GET /api/og?title&subtitle` (Node runtime, `next/og`; Fraunces 600 + Inter 500 **woff** in `assets/og/` with their OFL licenses, since Satori can't read woff2; traced via `outputFileTracingIncludes`; CDN-cached a day). `pageMetadata` adds the image to OG and Twitter for every route. JSON-LD builders in `lib/seo/json-ld.ts`: `WebSite` in the root layout, `WebPage` + `BreadcrumbList` emitted by `Breadcrumbs` (so markup follows the visible trail), `Article` on guides, existing `FAQPage`. No `LocalBusiness` (concept). `/llms.txt` built from the route registry.
- **P6-02:** Proof drawer (`components/proof/*`): header button on desktop, a "Proof" row in the mobile menu (`openProof()` event), and `#proof` in any URL opens it; the tab panel is a lazy chunk so timeline/report JSON never loads with the page. Quality scores come from `pnpm quality`, which parses the saved Lighthouse HTML in `public/reports/` into `content/quality.json` (schema-validated). Limits/How-it-works copy in `lib/proof/content.ts`, all statements traceable to code or data. `POST /api/feedback` (email only with consent; honeypot answers 200 and stores nothing). Feedback form on /launch-notes and /accessibility. Fixed `container-page max-w-3xl` centering the body of /privacy and /accessibility away from their H1.
- **P5-06:** `GET /api/stats` (aggregates only, `Cache-Control: s-maxage=5`); pure shaping in `lib/stats/summary.ts` (city buckets, ticker merge, testing medians). "Renders" counts `status = success` only. Testing numbers cover all test sessions; completion = reached a rebate (`first_estimate_at` set). `LIVE_SINCE` unset → start of today in Arizona (was pinned to Sunday noon, which would have shown zeros all Saturday). `/live` keeps the site header/footer (concept disclosure) and adds a Full screen button for the projector; QR via `uqr` (client-side, `?src=qr-pitch`). Verified against the dev Neon branch (test rows written there, not production).
- **P5-05/07/08:** `lib/analytics/whitelist.ts` (shared event/prop whitelist, sources, buckets; no Zod so the client can use it), `lib/analytics/client.ts` (sessionStorage `ss_sid/ss_src/ss_v/ss_team/ss_test`, batched `sendBeacon` with a `fetch` fallback, flush on `pagehide`/hidden). First load reads `?src=`/`utm_source` (else `referral:<host>` or `direct`), `?v=`, `?team=1`, `?t=` and strips all but `v` via `history.replaceState`. `POST /api/events` drops unknown names/props silently and stores paths without query strings. `?t=T01` → `POST /api/test-sessions` → ID sent with the studio's first estimate, which stamps `first_estimate_at` (unknown IDs ignored). `page_view` from `components/analytics/page-views.tsx` in the layout; hero CTA impression/click from `HeroCta`.
- **Studio/visualizer remount keys** now use only the params they read (`lib/utils/url.ts pickParams`). Keying on the full `location.search` meant the analytics URL cleanup could remount the studio and wipe input on tagged links.
- **e2e and beacons:** Playwright can't read `sendBeacon` bodies; `tests/e2e/analytics.spec.ts` removes `navigator.sendBeacon` so the fetch fallback carries the payload.
- **P5-02–04:** `lib/booking/slots.ts` (Arizona-date calendar, 10 days after today without Sundays, ~30% windows taken by FNV hash; the server also accepts yesterday's calendar so a page loaded before midnight still books), `lib/booking/store.ts` (Drizzle, or a `globalThis` map under `MOCK_DB` so the API and the confirmation page share it), `lib/notify` (ntfy adapter, 4 s timeout, never throws; mock under `MOCK_NOTIFY` or no topic), `lib/booking/ics.ts` (UTC times). Repeat submits with the same idempotency key return the first booking and don't re-notify. `/book` renders the picker per request (`await connection()`; the estimate summary needs `?estimateId=`); the confirmation reads the booking in Suspense and `notFound()`s unknown IDs.
- **P5-01:** `lib/eligibility/evaluate.ts` resolves questions from `eligibilityQuestions` (fills `{City}`, `{minimum}`, `{healthy}` from the program; the removed-grass question is forced in, FR-ELIG-04). The server page passes resolved questions plus server-rendered documents/source blocks to the client flow (no Zod in the bundle). `?city=` is read when Start is pressed (no remount, no Suspense). Scottsdale and "Another city" get a status answer and store nothing. `POST /api/eligibility` stores `{programId, result, reasonCodes}` with codes like `utility:check`.
- **P0:** repo `Devils-Ghost/sonoran-swap` (private; GitHub Free → no branch protection; merged branches auto-delete). Vercel project linked (`vercel.json` declares Next.js; the project was imported as "Other"). Neon migrated (dev + prod). Mapbox, ntfy (phone confirmed), Cloudflare verified. No payment method on any account (team confirmed Oct 15).
- **P1:** tokens in `app/globals.css` (`@theme`), shadcn primitives restyled in `components/ui/*` (+ `segmented-control.tsx`, `slider.tsx`), layout in `components/layout/*`, route registry `lib/routes.ts` drives titles/descriptions/sitemap.
- **P2:** engine `lib/rebates/engine.ts` (pure, all §7.5 tests), `lib/estimate/{pricing,water,area,estimate}.ts`, home `QuickEstimate`, Studio `components/studio/*`, `POST /api/estimates`.
- **P3:** adapter `lib/ai/*` (cloudflare, gallery, mock; gemini → gallery), `POST /api/render`, browser preprocessing `lib/visualize/preprocess.ts`, UI `components/visualize/*` (`CompareSlider` is reusable for the home hero), download composite `lib/visualize/composite.ts`. 3 AI-generated before photos + 9 renders in `public/samples/` (see `PROVENANCE.md`).

## 2. Environment (names only; values live in `.env.local` and Vercel)

| Variable | Local `.env.local` | Vercel |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | localhost | Prod, Preview |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | dev branch | Prod; Preview is per-branch (Neon preview branching) |
| `IP_HASH_SALT` | set | all |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | set | all |
| `NTFY_TOPIC` | set (`MOCK_NOTIFY` removed) | all |
| `GEMINI_API_KEY` | set, **unusable** (free image quota is 0) | — |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | set | Prod |
| `IMAGE_PROVIDER`, `IMAGE_MODEL` | `gallery` locally | Prod: `cloudflare`, `@cf/black-forest-labs/flux-2-klein-4b` |
| `MOCK_IMAGE_PROVIDER` | `1` locally | removed |

- **`NEXT_PUBLIC_*` are inlined at build:** after changing one in Vercel, redeploy. Server vars also bind per deployment.
- `lib/env.ts` fails `next dev`/`next build` with a full list of missing variables; it never runs for `next typegen`/tests.
- Vercel CLI is logged in on the dev machine and the folder is linked (`.vercel/`, gitignored). `npx vercel ls --prod`, `npx vercel inspect <url> --logs`, `npx vercel env ls`. Never print env values.

## 3. Decisions and why (non-obvious; don't re-litigate without new information)

1. **Sample photos are AI-generated** (team decision Oct 15). No freely licensed Phoenix front-lawn photo exists on Wikimedia/Openverse; Unsplash needs a key; web-searched photos were copyrighted, showed a house number, and were too small (kept out of git). Before photos carry `business.disclosures.sample` ("AI-generated sample yard. Not a real home."), schema-enforced.
2. **Image provider = Cloudflare Workers AI `flux-2-klein-4b`.** Gemini: every image model returns 429 `free_tier_requests limit: 0`. Cloudflare REST: `POST /accounts/{id}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`, **multipart** fields `prompt`, `width`, `height`, `input_image_0` (image edit); response `{ result: { image: <base64 JPEG> } }`. Edits 6–17 s (median ≈ 11 s). Free 10,000 neurons/day ≈ 53 edits at 1536×1024 (≈ 79 at 1024×688). `RENDER_DAILY_CAP` default 40. Field names were found by testing; Cloudflare's docs don't list them.
3. **Rebate engine and estimate modules import `content/*.json` directly** (typed by the schema) instead of `lib/content/load.ts`, so client bundles don't ship Zod. Content is validated at build by `pnpm validate:content`.
4. **Mesa note text is quoted from its own rule lists** in `rebate-programs.json`, never hard-coded (AGENTS §2.2).
5. **Studio map loads Mapbox GL (≈510 KB gz) only on demand** (after an address is chosen or "Show the map"). Address search is plain HTTP. Custom outline tool (no mapbox-gl-draw).
6. **Studio reads `?sqft&city&tier` on the client** (`StudioRoot` + `useSyncExternalStore`) instead of `useSearchParams` in Suspense: removed CLS 0.126.
7. **Header hides its "See my rebate" CTA on `/studio`** so the results panel's "Book a free yard walk" is the only primary button (D2).
8. **Fraunces without the `opsz` axis** (66 → 36 KB; +1–2 Lighthouse points).
9. **Footer credit omits the venue** (a sponsor; HACKATHON §3.4 bans sponsor names). **404 copy from SRS §6.17** over CONTENT §8.
10. **Modern Desert prompt avoids the words "red yucca"** (the model drew red-leaved plants); describes hesperaloe instead. `styles.json` basePromptVersion 2.
11. **The visualizer never pairs a visitor's photo with someone else's render.** Gallery mode, daily cap, mock, provider failure or timeout all show the sample yard's own before/after pair, labeled "Example rendering for this style" (gallery) or "Example rendering (live preview unavailable)" (everything else). The API reports which via `data.reason` (`GALLERY` | `MOCK` | `DAILY_CAP` | null).
12. **The daily cap fails closed:** if the render count can't be read, the route serves the gallery instead of spending quota. Window = UTC day (Cloudflare resets at 00:00 UTC).
13. **Client IP for rate limits** prefers `x-vercel-forwarded-for`, then `x-real-ip`, then `x-forwarded-for` (Vercel overwrites XFF to prevent spoofing). e2e tests set a unique `x-forwarded-for` per test because render allows 5 per 10 min per IP.
14. **`outputFileTracingIncludes` for `/api/render`** bundles `public/samples/*.jpg` into the function (gallery and mock read them from disk).
15. **A/B headline via `proxy.ts`:** `/?v=b` is rewritten to the prerendered `/home-b` (noindex, canonical `/`, disallowed in robots). Both variants are static; no cookies; URL keeps `?v=b`.
16. **Program wording comes from `lib/rebates/summary.ts`** (city cards, FAQ, later the rebates hub/city pages). FAQ answers are built in `lib/faq.ts` from data.
17. **CompareSlider layering:** the *before* image is the full-frame base (preloaded, stable LCP element) and *after* is the clipped overlay. Local files go through `next/image`; uploads/API renders are plain `<img>`.
18. **Native controls where they're enough:** the city picker is a native `<select>` and the FAQ is native `<details>` (`components/shared/faq-list.tsx`). `components/ui/select.tsx` and `accordion.tsx` are now unused.
19. **Lighthouse LCP on the home page is simulated, not real:** observed LCP ≈ 0.29 s; the 3.6–4.3 s simulated value is the slow-4G replay of ~250 KB JS + fonts + images requested before first paint. To move it, cut JS on the home page (P7-05).
20. **No invented social proof:** the Signature tier badge was "Most chosen" (seeded in pricing.json and SRS §3.4) but a concept business has no customers; changed to "Recommended" per AGENTS §2.1 / HACKATHON §5 (HACKATHON outranks SRS).
21. **Guides are MDX** (`@next/mdx`, `pageExtensions: ["ts","tsx"]`, `mdx-components.tsx` at the root) imported dynamically by `app/guides/[slug]`. Metadata lives in `lib/guides.ts` (no frontmatter plugin). Facts inside MDX come from `components/guides/facts.tsx` (`<Fact>`, `<Rules>`, `<Quote>`). The fall-planting guide only states what the KJZZ transcript (Oct 29, 2024) says; it names the guest by role because the page spells her name two ways.
22. **`"use cache"` for build-time file reads** on `ensureStatic` routes (guide reading time).
23. **Neon preview branching left on** (free; branches auto-clean when git branches are deleted). Preview deployments enabled.
24. **Automatic free map fallback (Oct 16, FR-EST-13).** Mapbox stays primary (backup close-ups take ~10–15 s cold, too slow for the pitch). When Mapbox refuses (401/403, or no token) the studio switches with no visitor action: address search retries the same query on **Photon** (`photon.komoot.io`, OpenStreetMap data, CORS, ~1–3 s, fair use, no key; `lib/geocode.ts`), and the map reopens on **MapLibre GL 6** over **USGS imagery** (`lib/free-map.ts`): cached `USGSImageryOnly` tiles to z16 under **NAIP** `exportImage` 512 px tiles (`{bbox-epsg-3857}`, 0.6 m, max source z17, overzoomed beyond). A geocode 429 switches only search (the map allowance is separate). A failing backup map shows "Map unavailable". The outline tool (`map-canvas.tsx`) takes a `createMap` factory; `map-canvas-mapbox.tsx` and `map-canvas-free.tsx` are the two engines, each lazy. /privacy lists Photon and USGS. Census geocoder was ruled out (no CORS).
25. **Mapbox account plan (team, Oct 16):** possibly two billable Mapbox accounts later (100k loads). This conflicts with AGENTS §2.10 ($0, no payment method) and Mapbox ToS forbids multiple accounts to stay under the free tier; the team accepted the risk. Switching accounts is **manual**: Mapbox has no usage API and no spend cap; set usage notifications (console.mapbox.com/account/settings/usage-thresholds), and on an alert swap `NEXT_PUBLIC_MAPBOX_TOKEN` in Vercel and redeploy (README "Changing the Mapbox token"). The free fallback covers any gap automatically.

## 4. Gotchas (save yourself an hour)

- **Next.js 16.4 + Cache Components** (`cacheComponents: true`): read `node_modules/next/dist/docs/` before using an API.
  - `dynamicParams` is rejected. Content-driven dynamic routes use `export const ensureStatic = "navigation"` + `generateStaticParams` + `notFound()` so unknown slugs return a real 404 (without it they return a 200 shell).
  - `usePathname()`/`useSearchParams()` in a client component on a dynamic route must be inside `<Suspense>` (see `MobileMenu` and `HeaderCta` in `components/layout/header.tsx`).
  - No `runtime = "edge"`; OG images (P6-03) must use the Node runtime.
  - `LayoutProps`/`PageProps` globals come from `next typegen` (already part of `pnpm typecheck`).
- **React Compiler lint rules** reject `setState` synchronously in effects and ref writes during render; restructure, don't disable.
- **Vitest:** globals off, so `tests/setup.ts` registers Testing Library cleanup and stubs `ResizeObserver` and `matchMedia`.
- **Radix single ToggleGroup renders `role="radiogroup"`/`radio`** (query tests accordingly).
- **mapbox-gl.css sets its container to `position: relative`**: give the map its own inner element.
- **MapLibre's worker under Turbopack:** MapLibre looks for `maplibre-gl-worker.mjs` next to its own module, which the bundler moves ("Worker failed to load", and GeoJSON outline layers never draw). `map-canvas-free.tsx` calls `setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href)`.
- **Outline layers are added on `style.load`, not `load`** (`load` waits for every visible tile, which on NAIP can take 10+ s). `isStyleLoaded()` is false while tiles stream, so the tool tracks its own `ready` ref.
- **Prettier ignores `content/*.json` and `*.md`** (hand-edited files; avoid reformat noise).
- **Dev-only 500 on first hit of a `generateStaticParams` route** (`SyntaxError: Unexpected end of JSON input`, e.g. `/rebates/mesa`, `/styles/modern-desert`): concurrent first compiles race in `next dev`; the next request is 200 and production builds never show it. Re-run before chasing it.
- **A `next dev` left running across many branch switches/rebases can fall into an HMR reload loop** ("[HMR] connected" + "Compiled in 2ms" on every load, pages reload forever, clicks lost). It's the server, not the app: restart it.
- **Lighthouse locally is 2–5 points noisier/lower than production.** Re-run before acting on one bad number. Command used: `npx -y lighthouse@12 <url> --form-factor=mobile --chrome-flags="--headless=new --incognito"`.
- **Windows dev machine:** PowerShell may need `pnpm.cmd`; Git Bash heredocs can mangle backslashes and `${}` (write scripts with the editor instead).
- **Neon:** migrations use `DATABASE_URL_UNPOOLED` (`drizzle.config.ts`). Preview branches copy production at creation.

## 5. Quality snapshot

- Tests (Oct 16 evening): 159 unit/component, 195 e2e (1440 + 375; axe on every route; keyboard journey; 320 px overflow guard; offline demo check). CI: typecheck, lint, unit, build, secret-name grep, e2e on a production build.
- Production Lighthouse mobile, **median of 3 runs** (Oct 16, saved in `public/reports/`, parsed into `content/quality.json` by `pnpm quality`): home **96** (LCP 2.65 s; was 86 before P7-05), studio **94**, rebates/phoenix **91** (runs 88–93, LCP = H1 3.0 s). Accessibility, Best Practices, SEO **100** on all three; CLS ≈ 0. Runs vary ±5 points between batches.
- Home first-load JS ≈ 180 KB gz (was ≈ 224 KB). Hero LCP photo: AVIF q60, 17 KB (was WebP 54 KB).

## 6. Open items

- [ ] P7-05 (optional): studio 94 and rebates/phoenix 91 (median) are under C1's 95. Their LCP is the H1 in Fraunces (48 KB variable woff2, preloaded). Options: static 600-weight subset, or `display: "optional"` (costs the heading font on a first visit). Not done: typography matters more than 3 points.
- [ ] P4-08 copy review: home headings not in CONTENT.md are placeholders ("What your city pays", "Low-water plants that belong here.", "Good questions, straight answers.", city-cards lead) plus the concept note on the promise guarantee. R4 to approve or replace.
- [x] /privacy re-checked against the code (Oct 16): Vercel analytics line removed until it's enabled; ntfy line states what the alert contains; prep-sheet map image added.
- [ ] Guide reading time undercounts (data-rendered lists aren't in the MDX source), e.g. Phoenix shows "1 min read".
- [ ] CONTENT §10.2 outline mentions watering new plants and what to plant first; the KJZZ source doesn't cover them, so the guide leaves them out. R4: add a sourced paragraph or keep as is.
- [x] P7-03 craft (D2): header CTA is now saguaro (`Button variant="brand"`), so each viewport has one terracotta primary (Fri Oct 16).
- [ ] P3-09 manual: try the visualizer on a real iPhone and Android phone (camera capture, HEIC on iOS).
- [ ] FR-EST-14 map snapshot for the prep sheet (with P6-06).
- [ ] **Mapbox token invalid (found Fri Oct 16 morning):** Mapbox answers 401 "Not Authorized - Invalid Token" (demo allowance used). The studio now falls back to Photon + USGS automatically (decision 24). Human: create a valid public token (README "Changing the Mapbox token"), URL-restrict it, update `.env.local` + Vercel, redeploy, and set usage notifications.
- [ ] `plants.json` links the Oct 2024 list PDF; ADWR's page now links `…/2025-01/2024_Phx5MPLWUPL_Final_v2.pdf` (human choice).
- [ ] Organizer answers (HACKATHON §8) not yet logged.
- [ ] One test estimate row exists in the production DB (Oct 15, before `INSIGHTS_SINCE`; harmless).

## 7. Next steps

1. **Humans:** work through `docs/MANUAL_CHECKS.md` (Mapbox token, Vercel Analytics, Search Console, phone checks, share previews, user tests, decisions log, video, demo rehearsal, `LIVE_SINCE`, submission from `docs/SUBMISSION.md`).
2. **Agents, Saturday/Sunday (Phase 8 rules: fixes and copy only after 10:30 Sunday):** act on user-test findings (P7-02) and log each change in `content/decisions.json`; add `@vercel/analytics` once it's enabled (and restore the /privacy line); run `pnpm timeline` and `pnpm seo-report` before the freeze; refresh Lighthouse medians (`pnpm quality`).

## Experimental V2 (Oct 17)

Explicit V2 brief: editorial homepage and connected studio sample preview, three process phases with six-step disclosure, public style state, reset, clearer reimbursement and privacy wording. SRS FR-HOME-01/02/03/09, FR-EST-09, FR-VIS-03/07/08, FR-DISC. Existing calculations/API/security retained. Main and production untouched. New editorial copy needs review; no new external factual claims.

V2 verification: typecheck/lint/build pass; 159 unit/component tests pass using one reused VM worker; full production Playwright rerun 209 passed, 3 skipped (no retries/failures). Five-width screenshots in ignored shots/. Default unit worker startup and initial screenshot-loop timeouts required the worker settings above. Final trust audit fixes /insights unverified submitted-sitemap prose to published sitemap. No new performance scores or external API verification claimed.

Final copy-only /insights follow-up: rebuild and lint pass; 4 focused insights browser tests pass. Complete browser suite before that isolated prose edit: 209 passed, 3 skipped. All code left uncommitted on the V2 branch for review.

## Repository publication cleanup

Removed the redundant V2 prompt, implementation summary and comparison checklist, plus local screenshot and test-report directories. Retained required agent/tooling documents, deployment guidance, hackathon submission/checklists/QR links, application MDX guides, image provenance, font licenses and published quality reports (FR-PROOF-02). No application code or user journeys changed. Temporary editor backups and scratch files are now ignored. Validation: typecheck, ESLint and Prettier passed; all 23 unit/component test files and 159 tests passed; content validation, SEO report generation and the production build passed (50/50 static pages). Deleted-document reference scan returned zero matches. Commands used installed Node tool entry points because the pnpm launcher resolved into an inaccessible user-profile directory; TypeScript build scripts ran with process-local loader hooks to bypass the sandbox OS-user lookup failure. Tests used the existing single-worker VM configuration. No browser/e2e rerun: no application source, assets or user journeys changed. No new TODO(VERIFY) items.

## Repository import and publication (Oct 17, 2026)

Imported the existing application snapshot in five coherent commits: initial application, public insights (FR-INS-01–13), unit/component tests, browser/accessibility tests, and CI/delivery documentation (FR-PROOF-02). The initial implementation contains 233 of 290 final files (80.3% by file count), including the narrow-screen project-option wrapping fix (FR-EST-15). The earlier six-commit local attempt was removed at the user's request; the replacement commits were then created and pushed individually with explicit authorization. These commits organize supplied code, not a verified historical development timeline. Earlier notes and quality reports are retained as supplied historical material.

Publication branch: phase-7/initial-implementation at https://github.com/Devils-Ghost/ship-ai-sonoran-swap. The remote main branch was not modified by these pushes. Regenerated content/timeline.json only through pnpm timeline; the generator includes feature/fix commits, so its two entries reference the actual initial implementation and insights commits. The inherited target of 15 timeline entries is intentionally not fabricated to satisfy the rubric.

A source/configuration recovery archive was created before the first staging operation; a separate Git bundle preserves the removed local history outside the repository. SHA-256 comparison of 280 tracked files against the source archive found no unexpected differences. Application functionality is preserved. Existing .gitignore excludes environment secrets, dependencies, build output, local screenshots, browser reports, uploads and temporary files. No dependencies or application features were removed.

Validation during this session: production build passed (50/50 static pages), content validation and SEO report generation passed (25 indexable routes with unique titles and OG images), typecheck/ESLint/Prettier passed. Latest unit/component rerun: 23 files and 159 tests passed with one VM worker. Latest full production browser rerun before the fourth commit: 209 passed, 3 existing skips, no failures. Responsive browser checks cover 320, 375, 768, 1024 and 1440 px; screenshots remain in ignored shots/. Providers were mocked; live providers, deployed behavior and hosted CI execution were not verified. The final slice adds CI and delivery documents only. No new TODO(VERIFY) items; inherited manual checks remain open.
