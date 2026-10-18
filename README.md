# Sonoran Swap

**The city pays. We do the swap.** A concept Phoenix desert-landscaping company and its marketing website, built for the Ship AI AZ GTM Hackathon (Workuity Biltmore, Oct 17–18, 2026).

Homeowners outline their lawn on a satellite map, see the city rebate they could get (Phoenix, Mesa, Chandler rules; Scottsdale status), preview their own yard as a desert garden with AI, check eligibility before removing anything, and book a free yard walk.

This repository imports an existing application snapshot. Its local commits group that snapshot by application, insights, tests and delivery tooling; they do not establish when the original development happened. Earlier development notes and saved reports are retained as supplied, without independently verifying their historical claims. The Proof timeline is regenerated from this repository's actual feature and fix commits with `pnpm timeline`.

## Start here

| If you are… | Read |
|---|---|
| Anyone, first | [`HACKATHON.md`](HACKATHON.md): rules, rubric, targets, submission |
| An AI coding agent | [`AGENTS.md`](AGENTS.md) (Claude Code: [`CLAUDE.md`](CLAUDE.md)) |
| Building a feature | [`docs/PHASES.md`](docs/PHASES.md) → [`docs/SRS.md`](docs/SRS.md) → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Designing UI | [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) |
| Writing copy | [`docs/CONTENT.md`](docs/CONTENT.md) |
| Changing data | [`content/`](content/): business, rebate programs, pricing, styles, plants, decisions log |
| Marketing analytics | SRS §11.8–11.9: the public `/insights` page and the `?src=` link-tagging scheme |

## Quick start (after Phase 0 scaffolding)

```bash
pnpm install
cp .env.example .env.local   # fill values; set MOCK_*=1 to work offline
pnpm db:migrate
pnpm dev
```

## Key facts encoded in `content/rebate-programs.json` (checked Oct 15, 2026)

| City | How it pays | Minimum | Cap | Approval first |
|---|---|---|---|---|
| Phoenix | $2.00 per sq ft | 250 sq ft | none fixed (>5,000 sq ft case by case) | Yes (NTP; up to 3 weeks) |
| Mesa | Tiers: $1,000 / $1,500 / $2,000 + $50 per new tree (max 2) | 500 sq ft | $2,100 | Yes (inspection) |
| Chandler | $1.50 per sq ft, 10 sq ft increments rounded up | 500 sq ft (waivable) | $2,000 | Yes (NtP; 90 days to finish) |
| Scottsdale | Closed since Oct 31, 2025; relaunching | — | last season up to $5,000 | Yes |

Funding status for Phoenix, Mesa and Chandler is not stated on their pages; the site says so.

## Changing the Mapbox token

The Studio's map, satellite imagery and address search all use one public token, `NEXT_PUBLIC_MAPBOX_TOKEN`. Change it when a token is revoked or leaked, or when a different team member's account takes over.

> Mapbox's Terms of Service forbid creating multiple accounts "for the purpose of not exceeding the monthly free usage credits." Don't rotate accounts to stretch free usage.

1. **Get the token.** On [console.mapbox.com](https://console.mapbox.com) → **Tokens**, copy the default public token (starts with `pk.`) or create one. Under URL restrictions, allow `https://sonoran-swap.vercel.app` and `http://localhost:3000`.
2. **Local:** in `.env.local`, set `NEXT_PUBLIC_MAPBOX_TOKEN=pk....` and restart `pnpm dev`.
3. **Production:** Vercel → Project → **Settings → Environment Variables** → edit `NEXT_PUBLIC_MAPBOX_TOKEN` for Production and Preview (or `npx vercel env rm NEXT_PUBLIC_MAPBOX_TOKEN production` then `npx vercel env add NEXT_PUBLIC_MAPBOX_TOKEN production`).
4. **Redeploy.** `NEXT_PUBLIC_*` values are built into the JavaScript, so the new token only takes effect after a new build: Vercel → **Deployments** → latest production deployment → **Redeploy** (or `npx vercel redeploy <deployment-url> --target production`).
5. **Check.** Open `/studio` in a private window, click **Show the map**, and search an address. If you still see "Map unavailable", test the token directly:

   ```bash
   curl -s "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=pk.YOUR_TOKEN" | head -c 120
   ```

   `"Not Authorized - Invalid Token"` means the token is wrong, revoked or out of allowance; a JSON style means it works and the deployment hasn't picked it up yet.

Usage and limits: **console.mapbox.com → Statistics** (per product, up to 24 h delay). Optional email alerts: **Account settings → Usage notifications**. Alerts never pause service, and Mapbox has no spending cap, so never add a payment method to a project account (see Cost).

## Cost
**$0 infrastructure.** Free plans only, no payment method on any account; every free-tier limit has a fallback. See `docs/ARCHITECTURE.md` §10.

## Status
Concept business. No real services are offered. Rebate information is real public information, attributed and dated.
