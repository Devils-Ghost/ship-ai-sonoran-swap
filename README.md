# Sonoran Swap

**The city pays. We do the swap.** A concept Phoenix desert-landscaping company and its marketing website.

Homeowners outline their lawn on a satellite map, see the city rebate they could get (Phoenix, Mesa and Chandler rules; Scottsdale status), preview their own yard as a desert garden, check eligibility before removing anything, and book a free yard walk.

Sonoran Swap is a concept business. No real services are offered. Rebate information is real public information, attributed to each city with the date it was checked.

## What the site does

| Feature | Where | What it does |
|---|---|---|
| Swap Studio | `/studio` | Measure a lawn on satellite imagery, by typing its size, or with a sample yard; see the estimated rebate, project and net cost ranges, water saved and timeline |
| Rebate engine | `lib/rebates` | City rules as pure functions over `content/rebate-programs.json`; the same code runs in the browser and on the server |
| Yard visualizer | `/visualize` | Upload a photo (prepared in the browser, EXIF and GPS stripped) and preview it in three desert styles with a before/after slider |
| Eligibility check | `/eligibility` | One question per screen; flags removing grass before approval |
| Booking | `/book` | Demonstration yard-walk booking with a push notification to the crew phone and a calendar file |
| Prep sheet | `/studio/prep` | Printable measurement and rebate sheet with the outlined map view |
| Live board | `/live` | Projector board with real counts since a start time |
| Growth insights | `/insights` | Funnel, click-through, headline test, sources and feature health from the site's own anonymous events |

Supporting pages: rebates by city, three landscape styles, a filterable low-water plant guide, how it works, pricing, three guides, privacy and accessibility.

## Tech stack

- **Next.js** (App Router, React, TypeScript strict), statically rendered pages, route handlers for APIs
- **Tailwind CSS** with design tokens as CSS variables; shadcn/ui primitives restyled to the brand
- **Zod** for every API input and every content file; invalid content fails the build
- **Postgres** (Neon) through **Drizzle ORM**; mocks for tests and demo mode
- **Maps:** Mapbox GL JS satellite with Mapbox search; automatic free backup of Photon search and MapLibre GL over USGS imagery
- **Images:** provider adapter (`cloudflare`, `gallery`, `mock`) with a daily cap and labeled examples as the fallback
- **Push:** ntfy
- **Tests:** Vitest, Testing Library, Playwright and axe

## Architecture

```
app/          routes: pages and /api route handlers
components/   UI kit, layout and feature components
content/      business data, rebate programs, pricing, styles, plants and MDX guides
lib/          pure logic (rebates, estimates, eligibility, slots), content loaders, analytics,
              providers, rate limiting, SEO
db/           Drizzle schema, client and migrations
scripts/      content validation, SEO report, build timeline, quality reports, screenshots
tests/        Playwright end-to-end and accessibility tests
```

- **One source of truth.** Rebate rules, prices, styles and plants live in `content/*.json`. Components never hard-code an amount.
- **Privacy by design.** Addresses are geocoded in the browser and never reach the server. The server keeps city, lawn size, options and anonymous events. Photos are never stored.
- **Fallbacks everywhere.** The map switches engines, previews fall back to labeled examples, a failed push never blocks a booking, and the manual and sample paths always work.

## Map engines

Mapbox is the primary engine. When the token is missing or Mapbox refuses (401/403), the studio switches with no visitor action:

- **Search** retries the same query on Photon (`photon.komoot.io`, OpenStreetMap data). A Mapbox 429 switches only search.
- **Map** reopens on MapLibre GL over USGS imagery: cached `USGSImageryOnly` tiles to zoom 16 under NAIP `exportImage` 512 px tiles (0.6 m, source max zoom 17, overzoomed beyond).
- If the backup map also fails, the studio shows "Map unavailable" with the manual and sample paths.

## Running locally

```bash
pnpm install
cp .env.example .env.local   # fill values; set MOCK_*=1 to work offline
pnpm db:migrate
pnpm dev
```

| Command | Purpose |
|---|---|
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | Types, lint and unit tests |
| `pnpm e2e` | Playwright end-to-end tests (mock providers) |
| `pnpm build` | Validates content, writes the SEO report and build timeline, then builds |
| `pnpm quality` | Reads saved Lighthouse reports in `public/reports` into `content/quality.json` |

## Changing the Mapbox token

The studio's map, satellite imagery and address search use one public token, `NEXT_PUBLIC_MAPBOX_TOKEN`.

> Mapbox's Terms of Service forbid creating multiple accounts "for the purpose of not exceeding the monthly free usage credits." Don't rotate accounts to stretch free usage.

1. **Get the token.** On [console.mapbox.com](https://console.mapbox.com) → **Tokens**, copy the default public token (starts with `pk.`) or create one. Under URL restrictions, allow `https://ship-ai-sonoran-swap.vercel.app` and `http://localhost:3000`.
2. **Local:** set `NEXT_PUBLIC_MAPBOX_TOKEN=pk....` in `.env.local` and restart `pnpm dev`.
3. **Production:** update `NEXT_PUBLIC_MAPBOX_TOKEN` in the Vercel project's environment variables.
4. **Redeploy.** `NEXT_PUBLIC_*` values are built into the JavaScript, so a new token takes effect after a new build.
5. **Check.** If the studio still shows "Map unavailable", test the token directly:

   ```bash
   curl -s "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=pk.YOUR_TOKEN" | head -c 120
   ```

   `"Not Authorized - Invalid Token"` means the token is wrong, revoked or out of allowance.

## Cost

**$0 infrastructure.** Free plans only, no payment method on any account, and every free-tier limit has a fallback.
