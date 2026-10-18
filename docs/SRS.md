# Software Requirements Specification: Sonoran Swap marketing website

| | |
|---|---|
| Document | SRS v1.0 |
| Date | Thursday, October 15, 2026 |
| Project | Sonoran Swap (concept Phoenix desert-landscaping company) |
| Deliverable | A public marketing website, live by Sunday, Oct 18, 2026, 11:30 AM Arizona time |
| Audience | AI coding agents and the four-person team |
| Authority | `HACKATHON.md` overrides this document. This document overrides architecture, design and content defaults. |

Requirement IDs use the pattern `FR-<AREA>-NN` (functional) and `NFR-<AREA>-NN` (non-functional). Priority: **M** = must ship (MVP), **S** = should ship (raise quality), **C** = could ship (only if time). Phases are in `docs/PHASES.md`.

---

## Table of contents

1. Introduction
2. Product overview
3. Business definition
4. Marketing and conversion optimization
5. Information architecture
6. Page specifications
7. Rebate engine
8. Lawn measurer and estimator ("Swap Studio")
9. Eligibility check
10. AI yard visualizer
11. Booking, notifications, live board, proof, feedback, disclosures, analytics
12. Component state matrix
13. Data models
14. API specification
15. Site-wide behavior
16. Non-functional requirements
17. Acceptance and traceability
18. Out of scope
19. Open items and items to verify

---

## 1. Introduction

### 1.1 Purpose
Specify everything a coding agent needs to build the Sonoran Swap marketing website: the business, the messaging, every page and behavior, the data, the APIs and the quality bars, so that the result scores at the top on **Design, Craft and Receipts** (see `HACKATHON.md` §3–4).

### 1.2 Scope
In scope: a multi-page marketing site with five interactive features (lawn measurer, rebate estimator, eligibility check, AI yard visualizer, booking with live notification), supporting content (rebate guides by city, styles, plant guide, pricing, process, FAQ, guides), a projector "live board," and a receipts layer. Out of scope: §18.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Xeriscape / desert landscape | A yard designed around low-water plants, rock ground cover and drip irrigation instead of grass. |
| Swap | Our name for converting a grass lawn to a desert landscape. |
| NTP | **Notice to Proceed**: written approval from a city before grass may be removed for a rebate. |
| Program | A city's grass-removal rebate or incentive (Phoenix, Mesa, Chandler, Scottsdale). |
| Concept mode | `business.mode = "concept"`: Sonoran Swap is not a real company; disclosures shown. |
| Partner mode | `business.mode = "partner"`: real business data loaded; concept disclosures hidden. |
| Render | An AI-edited image of a user's yard photo in a chosen style. |
| DG | Decomposed granite: fine crushed granite used as ground cover. |

### 1.4 References
- `HACKATHON.md` (rules, rubric, targets)
- `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/CONTENT.md`, `docs/PHASES.md`
- `content/*.json` (business, rebate programs, pricing, styles, plants)
- Official program pages (URLs in `content/rebate-programs.json`), last checked Oct 15, 2026.

---

## 2. Product overview

### 2.1 The business in one paragraph
Sonoran Swap converts grass lawns in the Phoenix metro into water-wise desert yards. Most cities in the Valley pay homeowners to remove grass, but the rules differ by city and one mistake (removing grass before approval) forfeits the money. Sonoran Swap measures the lawn, shows the rebate, previews the new yard, prepares the paperwork, waits for approval, then does the swap.

### 2.2 Positioning
- **One-liner:** Sonoran Swap turns Phoenix lawns into desert yards, and the city helps pay for it. Measure your lawn, see your rebate and preview your new yard in about a minute.
- **Hero headline (variant A):** Phoenix will pay you to lose your lawn.
- **Hero headline (variant B):** Swap your lawn for the Sonoran. The city helps pay.
- **Tagline:** The city pays. We do the swap.
- **Promise:** Approval first. Always. (We never remove grass before your city approves your project in writing.)

### 2.3 Primary user and job to be done
Phoenix-metro homeowner with a grass lawn who is tired of the water bill, the summer brown-out or the maintenance. **Job:** "Tell me what I'd get back, what it would look like and what it costs, without a sales call."

Secondary visitors: a homeowner whose city is not covered (wants to know if their city has a program); a skeptic comparing companies; a judge testing the site.

### 2.4 Differentiators (what common landscaper sites do not do)
1. **Measure your lawn on a satellite map** and get square footage instantly (no site visit needed to start).
2. **City-specific rebate math** with sourced rules and a "last checked" date (Phoenix per-sq-ft, Mesa tiers, Chandler per-sq-ft with rounding and cap, Scottsdale status).
3. **AI preview of your own yard** in three desert styles with a before/after slider.
4. **Approval-first eligibility check** that warns about the most expensive mistake.
5. **Printable rebate prep sheet** with the measured area and the city's document checklist.
6. **No chatbot, no contact wall.** Answers come before any request for contact details. (This is deliberate: chat widgets are commodity; tools that finish the job are not.)

### 2.5 Constraints
- Live by Sunday 11:30 AM; four people plus AI agents; free or low-cost services.
- Concept business: no real customers, reviews or licenses may be shown.
- Rebate rules change; all values live in data with dates and sources.
- The demo happens in a venue with uncertain Wi-Fi; every network feature needs an offline-safe fallback.

### 2.6 Assumptions
- Visitors have a modern browser (last two versions of Chrome, Safari, Firefox, Edge; iOS 16+ Safari).
- The water utility usually matches the city in the address, but not always; the user confirms it (FR-EST-08).

---

## 3. Business definition

All values below live in `content/business.json` and `content/pricing.json` (seed files provided). Components read them; nothing is hard-coded.

### 3.1 Identity
| Field | Value |
|---|---|
| name | Sonoran Swap |
| mode | `concept` |
| tagline | The city pays. We do the swap. |
| shortDescription | Lawn-to-desert conversions for Phoenix-metro homes, with the city rebate paperwork handled. |
| promise | Approval first. Always. We never remove grass before your city approves your project in writing. |
| promiseGuarantee (concept) | If we ever remove grass before approval and you lose your rebate, we pay you the rebate amount. |
| hours | Yard walks Monday–Saturday, 7 AM – 5 PM |
| phone / email / address | **None in concept mode.** Contact happens through booking and feedback forms. |
| serviceCities | Phoenix, Mesa, Chandler, Tempe, Scottsdale, Gilbert, Glendale |
| rebateCities | Phoenix, Mesa, Chandler (calculated); Scottsdale (status only) |

### 3.2 Services
| Service | Description |
|---|---|
| Lawn-to-desert conversion | Remove grass, cap or convert sprinklers, grade, install plants, drip irrigation and 2-inch granite top dressing. The core offer. |
| Drip irrigation conversion | Replace spray heads with drip emitters at each plant. |
| Desert planting and trees | Low-water plants and shade trees chosen from the regional low-water plant list. |
| Rebate paperwork help | Measurement, aerial image with area, photo checklist, plant list for the application. Free with a conversion. |
| First-season care visit | One visit after the first monsoon or frost to adjust drip and replace losses. Included. |

### 3.3 Process (six steps; used on home, /how-it-works and in the booking confirmation)
1. **Measure:** you measure online; we confirm on a free yard walk.
2. **Design:** pick a style (Sonoran Native, Modern Desert, Pollinator Garden); we draw the plan.
3. **Apply:** we prepare your city application packet; you submit it.
4. **Approval:** we wait for the city's written approval (Notice to Proceed). Nothing is removed before this.
5. **Swap:** grass out; drip in; plants and granite in.
6. **Rebate:** final photos and paperwork; the city inspects and pays you.

### 3.4 Pricing (illustrative concept pricing; seed in `content/pricing.json`)
| Tier | Price per sq ft | What's included |
|---|---|---|
| Essentials | $6 – $9 | Grass removal, drip conversion, 2" granite, plants for 50% mature canopy coverage, one-page plan |
| Signature (most chosen) | $10 – $15 | Essentials + design consultation, boulders and accent plants, path or seating area, lighting prep |
| Showcase | $16 – $24 | Signature + custom hardscape, dry creek bed, low-voltage lighting, shade tree package |

- Minimum project: **$3,000**.
- Display rules: always show as a range; caption "Illustrative concept pricing" in concept mode; never show a single exact price.
- Net cost = project range − estimated rebate (floor at $0; if rebate exceeds low estimate, show "$0 – $X").

### 3.5 Water-savings estimate
- Constant `WATER_GAL_PER_SQFT_YEAR = 23` (estimate). Derivation: KJZZ reported a City of Phoenix figure that an acre of grass uses about one million gallons per year; 1,000,000 / 43,560 sq ft ≈ 23. Source and derivation stored in `content/business.json → waterEstimate`.
- Always display as "≈ X gallons a year (estimate)" with an info tooltip showing the derivation and source link.

### 3.6 Disclosures (concept mode)
| Location | Text |
|---|---|
| Nav badge (all pages) | "Concept business" pill linking to /launch-notes#about |
| Footer (all pages) | "Sonoran Swap is a concept business built for the Ship AI AZ GTM Hackathon. Rebate information comes from official city pages; eligibility and payment are decided by each city. Not affiliated with any city." |
| Pricing captions | "Illustrative concept pricing." |
| Booking confirmation | "This is a demonstration booking. No one will visit. This shows how booking would work." |
| Visualizer output | "AI concept rendering. Actual results vary." |
| Privacy page | Full statement (§15.8) |

---

## 4. Marketing and conversion optimization

### 4.1 Messaging hierarchy
1. **Money:** the city pays you (Phoenix $2/sq ft; Mesa up to $2,100; Chandler up to $2,000), shown as *your* number within seconds.
2. **Picture:** see your own yard as a desert garden.
3. **Safety:** approval first; we protect your rebate.
4. **Season:** fall is planting season, and approval can take weeks, so start now.
5. **Impact:** water saved, as an estimate.

### 4.2 Conversion funnel and events
| Stage | Goal | Primary event |
|---|---|---|
| Land | Understand in 5 s | `page_view`, `hero_cta_click` |
| Engage | Get a rebate number | `estimate_shown` |
| Desire | See the yard | `render_success` |
| Reassure | Pass eligibility | `eligibility_result` |
| Act | Book a yard walk | `booking_confirmed` |

### 4.3 Calls to action
- **Primary (everywhere):** "See my rebate" → /studio.
- **Secondary:** "Preview my yard" → /visualize.
- **Tertiary (after value is shown):** "Book a free yard walk" → /book (carries `estimateId`).
- Never more than one primary-styled button per viewport.

### 4.4 Seasonal hook (true on demo day)
- Fall is a good planting window in Phoenix, before the short days of December and January slow growth (KJZZ, master gardener interview; link in guide).
- Phoenix pre-approval review can take up to 3 weeks; starting in October means planting in November.
- Copy: "Start in October, plant in November. Approval comes first, and it can take up to three weeks."

### 4.5 SEO strategy
| Page | Primary query intent | Title pattern (≤ 60 chars) |
|---|---|---|
| / | phoenix desert landscaping, lawn to desert conversion | Sonoran Swap · Lawn-to-Desert Yards in Phoenix |
| /rebates/phoenix | phoenix grass removal rebate | Phoenix Grass Removal Rebate: $2/sq ft, Explained |
| /rebates/mesa | mesa grass to xeriscape incentive | Mesa Grass-to-Xeriscape Incentive: Tiers & Rules |
| /rebates/chandler | chandler grass removal rebate | Chandler Grass Removal Rebate: $1.50/sq ft, Explained |
| /rebates/scottsdale | scottsdale turf removal rebate | Scottsdale Grass Removal Rebate: 2026 Status |
| /guides/phoenix-grass-rebate-step-by-step | how to apply phoenix grass rebate | How to Get Phoenix's Grass Removal Rebate, Step by Step |
| /guides/fall-planting-phoenix | what to plant in october phoenix | Fall Planting in Phoenix: Start Your Desert Yard Now |
| /plants | low water plants phoenix | Low-Water Plants for Phoenix Yards |

- Each page: unique title and meta description (≤ 155 chars), canonical URL, Open Graph image.
- Internal links: every rebate page links to /studio and /eligibility; every guide links to its city page.
- Structured data: `WebSite`, `WebPage`, `BreadcrumbList`, `FAQPage` (on /how-it-works and rebate pages), `Article` (guides). **No `LocalBusiness` markup in concept mode.**

### 4.6 Trust strategy (no fabrication)
- Real, sourced public facts (rebate rules) with dates.
- The approval-first promise and the mistake warning.
- Transparent pricing ranges.
- A plant guide that is useful even if you never hire us.
- Receipts (Proof drawer) showing how the site was built and tested.
- Tester feedback with permission (labeled).

### 4.7 Shareability
- Visualizer result: "Download before/after" image with labels and watermark "AI concept rendering · sonoranswap" (FR-VIS-14).
- Estimate result: "Copy link" producing `/studio?sqft=1240&city=phoenix&tier=signature` (no address, no coordinates).
- Dynamic OG images per page (FR-SEO-04).

### 4.8 A/B headline test (for receipts)
- Variant chosen by query param `?v=a|b` (default `a`); no cookies.
- During Saturday user tests, half the testers get each variant; record time-to-first-estimate and five-second-test answers in `test_sessions`. Publish the result on /launch-notes either way.

---

## 5. Information architecture

### 5.1 Routes (≥ 18 live; target 26)
| # | Route | Purpose | Priority |
|---|---|---|---|
| 1 | `/` | Position, demonstrate, convert | M |
| 2 | `/studio` | Lawn measurer, rebate and project estimate (Swap Studio) | M |
| 3 | `/studio/prep` | Printable rebate prep sheet | S |
| 4 | `/visualize` | AI yard visualizer | M |
| 5 | `/eligibility` | Approval-first eligibility check | M |
| 6 | `/rebates` | Compare city programs | M |
| 7 | `/rebates/phoenix` | Phoenix program explained | M |
| 8 | `/rebates/mesa` | Mesa program explained | M |
| 9 | `/rebates/chandler` | Chandler program explained | M |
| 10 | `/rebates/scottsdale` | Scottsdale status | S |
| 11 | `/styles` | Three styles overview | M |
| 12–14 | `/styles/[slug]` | sonoran-native, modern-desert, pollinator-garden | S |
| 15 | `/plants` | Filterable low-water plant guide | S |
| 16 | `/how-it-works` | Six-step process, promise, FAQ | M |
| 17 | `/pricing` | Tiers, ranges, what's included, net-cost explainer | M |
| 18 | `/guides` | Guide index | S |
| 19–21 | `/guides/[slug]` | phoenix-grass-rebate-step-by-step, fall-planting-phoenix, artificial-turf-and-rebates | S |
| 22 | `/book` | Book a free yard walk (demo in concept mode) | M |
| 23 | `/book/confirmed/[id]` | Confirmation and what happens next | M |
| 24 | `/live` | Projector live board | S |
| 25 | `/launch-notes` | Receipts, about the concept, limits, feedback | M |
| 26 | `/privacy` | Privacy statement | M |
| 27 | `/accessibility` | Accessibility statement | S |
| 28 | `/insights` | Public, read-only growth insights: funnel, click-through, A/B, sources, audience, feature health, SEO readiness, data-driven changes | S |
| — | 404 | Custom not-found | M |

### 5.2 Navigation
- **Header (desktop):** logo · How it works · Rebates · Styles · Pricing · Guides · [Proof] icon button · [Concept business] badge · **See my rebate** (primary).
- **Header (mobile ≤ 767 px):** logo · [See my rebate] compact button · menu button. Menu sheet lists all items with 48 px rows; Proof and concept badge inside.
- Header is sticky; it shrinks from 72 px to 56 px after 24 px scroll; adds a hairline border when scrolled.
- **Footer:** four columns (Swap: Studio, Visualize, Eligibility, Book · Learn: Rebates by city, Styles, Plants, Guides · Company: How it works, Pricing, Launch notes, Insights · Legal: Privacy, Accessibility), disclosure text, "Built at Ship AI AZ, Oct 17–18, 2026."
- **Breadcrumbs** on all pages except home, studio, visualize, live.

---

## 6. Page specifications

Each page lists sections in order, behaviors and acceptance criteria (AC). Copy references point to `docs/CONTENT.md`.

### 6.1 Home `/` (FR-HOME)
| ID | Section | Specification | P |
|---|---|---|---|
| FR-HOME-01 | Hero | Left: H1 (variant A/B), subhead, primary CTA "See my rebate" (→ /studio), secondary link "Preview my yard" (→ /visualize), trust line "Rebate rules from official city pages · last checked Oct 15, 2026". Right (desktop) / below (mobile): before/after slider of the sample yard (pre-rendered, labeled), with space reserved (no layout shift). | M |
| FR-HOME-02 | Quick estimate strip | Inline mini-estimator inside the hero: city select (Phoenix default), lawn size slider 250–5,000 sq ft (step 10) with number input, live output "Estimated rebate: $X" via the engine, link "Measure my actual lawn →". Mesa shows tier; Scottsdale shows status. | M |
| FR-HOME-03 | How the swap works | Six steps from §3.3 as a horizontal strip (desktop) / vertical list (mobile). Step 4 "Approval" visually highlighted with the promise. | M |
| FR-HOME-04 | Rebates by city | Cards for Phoenix, Mesa, Chandler (headline amount, minimum, approval requirement, "last checked") and a Scottsdale status card. Each links to its page. | M |
| FR-HOME-05 | Styles teaser | Three cards with pre-rendered before/after thumbnails, 3 signature plants each, link to /styles/[slug] and "Try it on my yard". | M |
| FR-HOME-06 | Approval-first promise | Full-width band: "Approval first. Always." + the mistake warning ("Removing grass before approval can cost you the whole rebate.") + link to /eligibility. | M |
| FR-HOME-07 | Why now | Fall planting + approval timing (§4.4) with source link. | S |
| FR-HOME-08 | Water impact | "A 1,000 sq ft lawn uses ≈ 23,000 gallons a year (estimate)." with tooltip derivation. | S |
| FR-HOME-09 | Pricing preview | Three tiers (range per sq ft), "Illustrative concept pricing", link to /pricing. | M |
| FR-HOME-10 | Plants preview | Six plant cards from `plants.json` (`featured: true`), link to /plants. | S |
| FR-HOME-11 | FAQ | 6 questions from CONTENT.md, accordion, `FAQPage` JSON-LD. | M |
| FR-HOME-12 | Final CTA | "Your lawn is costing you water. Your city wants it gone." + primary CTA. | M |

**AC:** LCP element is the H1 or hero image, < 2.5 s mobile; the mini-estimator produces correct numbers for all boundary cases in §7.5; no CLS from the slider; only one primary button visible per viewport.

### 6.2 Swap Studio `/studio` (FR-EST; detailed in §8)
Layout (desktop): map canvas (left, 60%) + results panel (right, 40%). Mobile: stepper with three steps (Find your home → Outline your lawn → Your results), map full-width at 60vh, results below.
Query params (all optional): `sqft`, `city`, `tier`, `v`, `t` (test session). If `sqft` and `city` are present, skip to results.

### 6.3 Prep sheet `/studio/prep` (FR-PREP)
| ID | Requirement | P |
|---|---|---|
| FR-PREP-01 | Reads `city`, `sqft`, `tier` from the query string; map snapshot passed via `sessionStorage` key `ss_prep_snapshot` (data URL), never sent to the server. | S |
| FR-PREP-02 | Printable A4/Letter layout (`@media print`): title "Lawn measurement & rebate prep sheet", date, city, measured area, map snapshot with area label, estimated rebate with program rules summary, the city's required-documents checklist (from `rebate-programs.json → documents`), the approval warning, source links, and the footer "Prepared with Sonoran Swap (concept). Not an official city form." | S |
| FR-PREP-03 | "Print / Save as PDF" button calls `window.print()`. No server-side PDF. | S |

### 6.4 Visualizer `/visualize` (FR-VIS; §10)

### 6.5 Eligibility `/eligibility` (FR-ELIG; §9)

### 6.6 Rebates hub `/rebates` (FR-RBH)
- Comparison table: city, how it pays (per sq ft or tiers), minimum, cap, approval required, time to finish after approval, status, last checked, official link. Data from `rebate-programs.json`.
- Note for other cities (Tempe, Gilbert, Glendale): "Not in our data yet. Check your water utility's conservation office."
- CTA: "See my rebate."

### 6.7 City rebate pages `/rebates/[city]` (FR-RBC)
Template sections: H1 with headline amount; "At a glance" facts; "How the money is calculated" with a worked example computed by the engine (1,200 sq ft); "Who qualifies" (eligibility list); "What you must not do" (the approval warning and city-specific prohibitions); "Documents you'll need"; "Timeline"; embedded mini-estimator locked to the city; FAQ; source link and last-checked date; CTA. Scottsdale page shows status, last season's maximum and the official notice; no calculator.

### 6.8 Styles `/styles`, `/styles/[slug]` (FR-STY)
Each style: description, mood words, pre-rendered before/after (sample yard), materials (ground cover, rock, edging), 6–8 plants from `plants.json` (filtered by `styles` field), maintenance level, "Try this style on my yard" → `/visualize?style=<slug>`.

### 6.9 Plants `/plants` (FR-PLT)
Filter chips: type (tree, shrub, cactus/succulent, groundcover, accent), sun (full, part), size, flower color, "pollinator friendly." Grid of cards: common name, botanical name, mature size, bloom season, water note, styles. Each plant notes "Verify on the ADWR Phoenix AMA Low-Water-Use/Drought-Tolerant Plant List" (link). Empty state when filters match nothing ("No plants match. Clear filters").

### 6.10 How it works `/how-it-works` (FR-HOW)
Six steps (expanded), the promise and guarantee (concept), what's included, what we never do (remove before approval, use artificial turf in rebate areas, use black plastic, leave bare soil), FAQ with JSON-LD.

### 6.11 Pricing `/pricing` (FR-PRC)
Three tier cards (ranges, includes), minimum project, "How net cost works" with an engine-driven example (1,200 sq ft Phoenix Signature: project $12,000–$18,000, rebate $2,400, net $9,600–$15,600), caption "Illustrative concept pricing," CTA to /studio.

### 6.12 Guides `/guides`, `/guides/[slug]` (FR-GDE)
MDX files in `content/guides/`. Each guide: title, description, updated date, reading time, table of contents, body, sources list, related links, CTA. Outlines in CONTENT.md. Three guides at launch.

### 6.13 Book `/book` (FR-BOOK; §11.1) and confirmation `/book/confirmed/[id]`

### 6.14 Live board `/live` (FR-LIVE; §11.3)

### 6.15 Launch notes `/launch-notes` (FR-PROOF; §11.4)

### 6.15a Insights `/insights` (FR-INS; §11.8)

### 6.16 Privacy `/privacy`, Accessibility `/accessibility` (FR-LEGAL)
Plain-language statements (§15.8). Accessibility statement: standard targeted (WCAG 2.2 AA), testing done, known gaps, contact via feedback form.

### 6.17 404 (FR-404)
Headline "This page dried up." Body: "Let's get you back to something green… er, desert." Links: Home, See my rebate. Returns HTTP 404.

---

## 7. Rebate engine (FR-REB)

### 7.1 Principles
| ID | Requirement | P |
|---|---|---|
| FR-REB-01 | All program data lives in `content/rebate-programs.json`, validated by Zod at build. | M |
| FR-REB-02 | `lib/rebates/engine.ts` exposes pure functions: `computeRebate(programId, input)` and `getProgram(programId)`. Same code runs in browser and server. | M |
| FR-REB-03 | Output is always an **estimate** with structured notes; UI must show "Estimated" and the city disclaimer. | M |
| FR-REB-04 | Every displayed figure shows the program's `lastVerified` date and `sourceUrl`. | M |

### 7.2 Input and output types
```ts
type RebateInput = {
  sqft: number;              // measured grass area to remove, integer ≥ 0
  trees?: number;            // qualifying new low-water trees (Mesa bonus), 0–2
  removesAllGrass?: boolean; // Chandler minimum waiver hint
};

type RebateResult = {
  programId: "phoenix" | "mesa" | "chandler" | "scottsdale";
  status: "open" | "unknown" | "closed";
  eligibleByArea: boolean;
  amount: number | null;      // whole dollars; null when not computable (closed/unknown)
  basis: string;              // e.g. "$2.00 × 1,240 sq ft"
  notes: RebateNote[];        // ordered, user-facing
  capApplied: boolean;
  minimumSqft: number | null;
  lastVerified: string;       // ISO date
  sourceUrl: string;
};
type RebateNote = { kind: "info" | "warning" | "blocker"; code: string; text: string };
```

### 7.3 Program rules (values from official pages, checked Oct 15, 2026)

**Phoenix** (`phoenix`, status `unknown`: page does not state funding status)
- Rate: **$2.00 per sq ft** of grass removed. Minimum **250 sq ft**. No fixed cap; projects over **5,000 sq ft** reviewed case by case "funds permitting."
- Approval: must receive a Notice to Proceed **before** removing any grass; review can take **up to 3 weeks**; **6 months** from NTP to finish.
- Grass must be alive and healthy at **≥ 75%** density (bare soil and weeds < 25%).
- Eligibility: property owner and Phoenix Water Services customer; landlords may apply for rentals.
- Replacement: describe it; desert landscaping recommended; **no water features or pools** in the removal area; **no bare soil** afterward; grass cannot be reinstalled while you own the property; right-of-way plants must be from the low-water list; HOA rules and Maricopa County Rule 310.01 apply.
- Documents: aerial image with square footage; two pre-removal photos; project description form; IRS W-9; Affidavit of Lawful Presence with ID copy (+ rental form for rentals); after completion, at least two photos and NTP copy.
- Apply online via myPHX311 only. Payment by mailed check, typically within 1–2 billing cycles after final approval.

**Mesa** (`mesa`, status `unknown`: limited funding, first-come, first-served)
- **Tiered**, not per sq ft: 500–999 sq ft → **$1,000**; 1,000–1,499 → **$1,500**; 1,500+ → **$2,000**.
- Tree bonus: **$50 per qualifying new low-water tree**, up to **2 trees ($100)**. Maximum total **$2,100**.
- Minimum **500 sq ft**. Approval and inspection before removal; **6 months** to finish.
- Grass about **70%** healthy coverage; well- or flood-irrigated grass ineligible; homes built within the past year ineligible; one incentive per property every **3 years**; only future projects.
- Replacement: plants reaching **≥ 50% canopy** at maturity from the ADWR low-water list; artificial turf or rock alone doesn't count; mulch ≥ 2"; concrete ≤ 25% of area; no spray irrigation; no black plastic; HOA approval may be needed; W-9 after completion.

**Chandler** (`chandler`, status `unknown`: first-come, first-served, subject to funds)
- **$1.50 per sq ft**, paid in **10 sq ft increments rounded up**; maximum **$2,000**.
- Minimum **500 sq ft** of living grass; may be waived if **all remaining grass** on the property is removed.
- Approval: Pre-Grass-Removal NTP application with ≥ 2 "before" photos; staff verify (may inspect); do not remove or overseed before NTP; **90 days** to complete after NTP.
- Eligibility: Chandler property owner, active Chandler water account, regularly irrigated grass; flood-irrigated areas and new construction excluded; work completed before Jan 1, 2026 ineligible.
- Replacement: Phoenix AMA low-water plant list (nursery-purchased); ≥ 50% canopy; ≥ 50% of landscapable area non-grass after conversion; granite ≥ 2"; no artificial turf, black plastic, fountains or pools in the rebate area; HOA rules.
- Payment: credit to the utility account after final inspection.

**Scottsdale** (`scottsdale`, status `closed`)
- Program closed Oct 31, 2025; to relaunch with a new season; requirements "under review"; last season offered **up to $5,000**. Do not begin removal until reopening and an NTP. Show status and official link; **no calculation**.

### 7.4 Algorithms
```
computeRebate("phoenix", {sqft}):
  if sqft < 250  -> amount 0, eligibleByArea false, blocker "PHX_MIN": "Phoenix requires at least 250 sq ft."
  amount = 2 * sqft
  if sqft > 5000 -> info "PHX_LARGE": "Projects over 5,000 sq ft are reviewed case by case, funds permitting."
  always notes: warning "APPROVAL_FIRST", info "PHX_HEALTHY_75", info "PHX_TIMELINE"

computeRebate("mesa", {sqft, trees=0}):
  if sqft < 500 -> amount 0, blocker "MESA_MIN"
  base = sqft >= 1500 ? 2000 : sqft >= 1000 ? 1500 : 1000
  bonus = 50 * clamp(trees, 0, 2)
  amount = base + bonus             // max 2100
  if sqft in [900,999] or [1400,1499] -> info "MESA_NEAR_TIER": "You're within 100 sq ft of the next tier."
  notes: warning "APPROVAL_FIRST", info "MESA_NO_TURF", info "MESA_ONCE_3Y"

computeRebate("chandler", {sqft, removesAllGrass=false}):
  if sqft < 500 and not removesAllGrass -> amount 0, blocker "CHD_MIN" (+ info about waiver)
  billable = ceil(sqft / 10) * 10
  raw = 1.5 * billable
  amount = min(raw, 2000); capApplied = raw > 2000
  if capApplied -> info "CHD_CAP": "Chandler caps the rebate at $2,000 (reached at 1,331 sq ft or more)."
  notes: warning "APPROVAL_FIRST", info "CHD_90_DAYS"

computeRebate("scottsdale", _):
  status closed -> amount null, notes info "SCT_CLOSED" with official link
```
Rounding: amounts are whole dollars (Chandler $1.50 × multiples of 10 is always whole). Area input is rounded to the nearest whole sq ft before computing.

### 7.5 Required unit tests (boundaries)
| Program | Input | Expected amount |
|---|---|---|
| Phoenix | 249 | 0 (blocker) |
| Phoenix | 250 | 500 |
| Phoenix | 1,240 | 2,480 |
| Phoenix | 5,001 | 10,002 + PHX_LARGE note |
| Mesa | 499 | 0 (blocker) |
| Mesa | 500 | 1,000 |
| Mesa | 999 | 1,000 + near-tier note |
| Mesa | 1,000 | 1,500 |
| Mesa | 1,500, trees 2 | 2,100 |
| Mesa | 3,000, trees 5 | 2,100 (trees clamped) |
| Chandler | 499 | 0 (blocker) |
| Chandler | 499, removesAllGrass | 750 (ceil(499/10)×10 = 500 billable sq ft × $1.50) |
| Chandler | 501 | 765 (510 × 1.5) |
| Chandler | 1,333 | 2,000 (1,340 × 1.5 = 2,010 → cap) |
| Chandler | 1,330 | 1,995 |
| Scottsdale | any | null, status closed |

### 7.6 Display rules
| ID | Requirement | P |
|---|---|---|
| FR-REB-10 | Amount shown as "Estimated rebate: $2,480" with basis line "$2.00 × 1,240 sq ft (Phoenix)". | M |
| FR-REB-11 | Blockers render as a warning card explaining the minimum and what to do (e.g., measure again, or "remove all grass" option for Chandler). | M |
| FR-REB-12 | The APPROVAL_FIRST warning appears with every result. | M |
| FR-REB-13 | Status `unknown` adds: "Funding is first-come, first-served. Confirm availability with the city before you start." | M |
| FR-REB-14 | Status `closed` replaces the amount with the status message and official link. | M |
| FR-REB-15 | Disclaimer under every result: "Estimate only. Eligibility and payment are decided by the City of {City}. Sonoran Swap is not affiliated with any city." | M |

---

## 8. Lawn measurer and estimator: Swap Studio (FR-EST)

| ID | Requirement | P |
|---|---|---|
| FR-EST-01 | Three entry paths shown at the top: **Measure on the map** (default), **I know my square footage** (manual), **Try a sample yard** (1,200 sq ft, Phoenix). | M |
| FR-EST-02 | Address search uses Mapbox geocoding **in the browser**, limited to the US and a Phoenix-metro bounding box; autocomplete after 3 characters, debounce 250 ms; keyboard selectable. The address string never leaves the browser except to Mapbox. | M |
| FR-EST-03 | Map uses a satellite style; initial view Phoenix metro (33.45, −112.07, zoom 10). On address select, fly to zoom 19 over 1.2 s (instant when reduced motion). | M |
| FR-EST-04 | Drawing: "Outline your lawn" tool lets the user click/tap points to draw one or more polygons; double-tap or tapping the first point closes a shape; shapes can be edited (drag vertices) and deleted; an "Undo point" button exists; a 10-second animated hint shows how on first use (skippable, respects reduced motion). | M |
| FR-EST-05 | Area: computed with `@turf/area` (m²) × 10.7639 → sq ft, rounded; shown live while drawing ("1,240 sq ft"); total across shapes shown in the results panel with a per-shape list. | M |
| FR-EST-06 | Sanity: shapes under 20 sq ft are ignored with a toast; totals over 20,000 sq ft show a warning ("That's larger than most residential lawns. Double-check your outline."). Self-intersecting shapes show "Shape crosses itself; adjust a corner." | M |
| FR-EST-07 | Manual path: number input 0–50,000 with step 1, plus "How to measure with a tape" tip (length × width per rectangle, add them up). | M |
| FR-EST-08 | Water-utility city: preselected from geocoder `place` (Phoenix, Mesa, Chandler, Scottsdale, Tempe, Gilbert, Glendale, Other); user confirms with "Your water bill comes from:" select. Non-program cities show "Not in our data yet" and still get pricing and water estimates. | M |
| FR-EST-09 | Results panel: estimated rebate (engine), basis line, notes (blockers, warnings, info), tier selector (Essentials / Signature / Showcase), project estimate range, net cost range, water estimate, timeline summary from program data, actions. | M |
| FR-EST-10 | Results update instantly (< 50 ms) when area, city, tier or Mesa trees change; numbers animate with a count-up (200 ms; none with reduced motion). | M |
| FR-EST-11 | Actions: **See it as a desert yard** (→ /visualize, carries style suggestion), **Check eligibility** (→ /eligibility?city=), **Book a free yard walk** (→ /book?estimateId=), **Print prep sheet** (→ /studio/prep), **Copy link**. | M |
| FR-EST-12 | On first result per page load, `POST /api/estimates` stores the server-recomputed estimate (city, sqft, source, tier, amounts). No address, no coordinates, no polygons. Failure to store must not affect the UI. | M |
| FR-EST-13 | Map failure (token, network, WebGL): show "Map unavailable" card with the manual and sample paths. The page must remain fully usable. | M |
| FR-EST-14 | Map snapshot for the prep sheet: when the user clicks Print prep sheet, capture `map.getCanvas().toDataURL()` (map created with `preserveDrawingBuffer: true`) with the outline visible, store in `sessionStorage`, then navigate. | S |
| FR-EST-15 | Mobile: stepper (Find → Outline → Results); results sheet docks at the bottom with the rebate visible at all times once computed. | M |
| FR-EST-16 | Attribution required by the map provider is visible and not covered by UI. | M |

**AC:** sample path shows a correct Phoenix result (1,200 sq ft → $2,400) in < 2 s; manual path computes all §7.5 cases; map path measures a drawn rectangle within ±3% of a known reference area (test fixture); no address appears in any network request to our domain (verify in Playwright with request interception).

---

## 9. Eligibility check (FR-ELIG)

| ID | Requirement | P |
|---|---|---|
| FR-ELIG-01 | One question per screen, 5–7 questions, progress indicator, back button; questions come from `rebate-programs.json → eligibilityQuestions[city]`. | M |
| FR-ELIG-02 | City selection first (prefilled from `?city=`). Scottsdale and non-program cities route to a status/"check your city" result. | M |
| FR-ELIG-03 | Each answer maps to `pass`, `fail` (with reason) or `check` (with reason). Final result: **Looks eligible** (all pass), **Not eligible right now** (any fail; list reasons and what would change it), **Check with the city** (any check, no fail). Never say "guaranteed." | M |
| FR-ELIG-04 | **Have you removed any of the grass yet?** "Yes" → fail with the message: "Most programs only pay for grass removed *after* approval. Don't remove more. Contact the city before you continue." This question always appears. | M |
| FR-ELIG-05 | Result screen includes the approval-first promise, the documents checklist, the official link and CTAs (See my rebate / Book a yard walk). | M |
| FR-ELIG-06 | Store only `{programId, result, reasonCodes}` via `POST /api/eligibility`. | S |

Default question set (per city, editable in JSON):
1. Do you own the home? (Phoenix: owners and landlords OK)
2. Is your water bill from the City of {City}?
3. Is the grass alive and green across most of the area? (Phoenix ≥ 75%; Mesa ~70%; Chandler "living grass")
4. Have you removed any of the grass yet?
5. Is the grass watered by flood irrigation or a private well? (Mesa, Chandler: fail if yes)
6. Was the home built within the past year? (Mesa: fail if yes; Chandler: new construction excluded)
7. Is the area at least {minimum} sq ft? (link to measurer)

---

## 10. AI yard visualizer (FR-VIS)

| ID | Requirement | P |
|---|---|---|
| FR-VIS-01 | Inputs: **Upload a photo** (file picker; `capture="environment"` on mobile) or **Use a sample yard** (3 bundled photos of generic lawns that we own or license; see §19). Accept JPEG, PNG, WebP, HEIC (convert HEIC client-side or reject with a clear message if unsupported). Max upload 12 MB before processing. | M |
| FR-VIS-02 | Client preprocess: fix orientation, downscale so the long edge ≤ 1536 px, re-encode JPEG quality 0.85, strip EXIF (including GPS). | M |
| FR-VIS-03 | Style picker: Sonoran Native, Modern Desert, Pollinator Garden (from `styles.json`), each with a swatch and a one-line description. `?style=` preselects. | M |
| FR-VIS-04 | Submit → `POST /api/render` (multipart: image, style). Progress UI with honest steps ("Uploading… Designing your yard… Adding plants…") driven by elapsed time, not fake percentages; cancel button. | M |
| FR-VIS-05 | Provider via adapter (`lib/ai/image-provider.ts`), selected by `IMAGE_PROVIDER` (`gallery` \| `gemini` \| `cloudflare` \| `mock`; all $0, see ARCH §10). In `gallery` mode, uploads show the closest pre-rendered result for the chosen style with the label "Example rendering for this style" (never presented as their own yard); prompt from `styles.json → prompt` with the base template in §10.1. | M |
| FR-VIS-06 | Timeouts: client waits up to 45 s; after 25 s show "Taking longer than usual" plus "See a sample instead"; server aborts at 50 s. | M |
| FR-VIS-07 | Result: before/after **comparison slider** (drag, click, keyboard ←/→ in 5% steps, Home/End; `role="slider"` with `aria-valuenow`); toggle buttons "Before / After / Compare." | M |
| FR-VIS-08 | Label on the image and in the UI: "AI concept rendering. Actual results vary." | M |
| FR-VIS-09 | Beside the result: the style's plant palette (from `plants.json`, not from the image), materials, maintenance level, and "Estimate this yard" (→ /studio) and "Book a yard walk." | M |
| FR-VIS-10 | Try another style reuses the same uploaded image (kept in memory only) without re-upload. | M |
| FR-VIS-11 | Privacy: images are never written to disk, database or logs by our server; forwarded to the image provider only for processing. Notice under the upload button: "Your photo is sent to our image provider to create the preview and isn't stored by us." | M |
| FR-VIS-12 | Fallback: on provider failure, timeout, rate limit or `MOCK_IMAGE_PROVIDER=1`, show a pre-rendered example for the chosen style with the label "Example rendering (live preview unavailable)." Log `render_failed` with a code. | M |
| FR-VIS-13 | Content guard: reject non-image files; if the provider refuses (safety filter), show "We couldn't process that photo. Try a photo of a yard." | M |
| FR-VIS-14 | Download: "Download before/after" composes a side-by-side PNG on a canvas (1600 × 900) with labels "Before" / "After: {Style}", the AI label and the site name. | S |
| FR-VIS-15 | "See it in July" toggle (C): applies a CSS filter (desaturate + warm) to the *before* image to show a heat-stressed lawn, labeled "Illustration." | C |
| FR-VIS-16 | Store metadata only via the render route: style, provider, status, duration, error code. | M |

### 10.1 Base prompt template
```
Edit this exact photograph. Keep the house, roofline, windows, doors, driveway, sidewalk,
fences, existing trees, sky, lighting, camera position and perspective unchanged.
Replace only the grass lawn areas with a {style.name} desert landscape typical of
Phoenix, Arizona: {style.materials}. Add plants such as {style.plantsPrompt}, spaced
naturally with realistic mature sizes, about half the area shaded by plant canopy.
Use drip-irrigated planting beds and 2-inch granite top dressing.
Do not add artificial turf, pools, fountains, water features, people, animals, vehicles,
text, signs or logos. Photorealistic, natural daylight, realistic scale.
```

---

## 11. Booking, notifications, live board, proof, feedback, disclosures, analytics

### 11.1 Booking (FR-BOOK)
| ID | Requirement | P |
|---|---|---|
| FR-BOOK-01 | `/book` shows: optional attached estimate summary (from `?estimateId=`), date picker for the next 10 days excluding Sundays, window choice (Morning 7–11 AM / Afternoon 1–5 PM), city select. | M |
| FR-BOOK-02 | Concept mode: **no personal fields**. Button text "Book a demo yard walk". Partner mode: first name, phone, email (optional), consent checkbox. | M |
| FR-BOOK-03 | Some slots shown as unavailable (deterministic by date hash) so the picker looks real; unavailable slots are not selectable and announced to screen readers. | M |
| FR-BOOK-04 | Submit → `POST /api/bookings` → creates record → sends notification (FR-NOTIF) → redirect to `/book/confirmed/[id]`. | M |
| FR-BOOK-05 | Confirmation: date/window, city, attached estimate, the six-step "what happens next" with step 1 highlighted, the concept disclosure, "Add to calendar" (.ics generated client-side), links to guides. | M |
| FR-BOOK-06 | Double-submit protection (button disabled + idempotency key). | M |

### 11.2 Notifications (FR-NOTIF)
| ID | Requirement | P |
|---|---|---|
| FR-NOTIF-01 | On booking, send a push via ntfy (`NTFY_TOPIC`, `NTFY_SERVER`) to the team's demo phone. Body: `SONORAN SWAP DEMO · Yard walk booked · {City} · {sqft} sq ft · est. rebate ${amount} · {Day} {Window}`. Priority high, tag `cactus`. | M |
| FR-NOTIF-02 | Push failure never blocks the booking; the booking record stores `notified` true/false. (Optional, only on a free no-card plan: email fallback.) | M |
| FR-NOTIF-03 | Confirmation page shows a "Sent to the crew's phone" preview card reflecting actual status (sent / not delivered). Never claim delivery that failed. | M |

### 11.3 Live board `/live` (FR-LIVE)
| ID | Requirement | P |
|---|---|---|
| FR-LIVE-01 | Full-screen 16:9 layout for a projector; large type; dark caliche-night theme variant. | S |
| FR-LIVE-02 | Counters since `LIVE_SINCE` (env ISO time; default start of today, Arizona): estimates run, total lawn measured (sq ft), total estimated rebates ($), renders created, bookings. Label: "Live from sonoranswap · since {time}". | S |
| FR-LIVE-03 | City breakdown bars (Phoenix, Mesa, Chandler, other) and a ticker of the last 8 events ("Mesa · 1,520 sq ft · $2,000 est."). No personal data. | S |
| FR-LIVE-04 | Polls `GET /api/stats?since=` every 5 s; counters animate; stale-data indicator if a poll fails 3 times. | S |
| FR-LIVE-05 | Big QR code to the home page (generated client-side) and the line "Scan, measure your lawn, watch it appear here." | S |

### 11.4 Proof drawer and launch notes (FR-PROOF)
| ID | Requirement | P |
|---|---|---|
| FR-PROOF-01 | "Proof" icon button in the header opens a right-side drawer (mobile: full-height sheet) on any page; focus trapped; Escape closes; URL hash `#proof`. | M |
| FR-PROOF-02 | Drawer tabs: **Timeline** (from `content/timeline.json`), **Quality** (Lighthouse/PageSpeed scores with dates and links to saved reports in `/public/reports`), **Testing** (tester count, median time to first rebate, completion rate, headline test result), **How it works** (engine and AI constraints, sources), **Limits** (honest list), **Privacy** (summary), plus a link to **/insights**. | M |
| FR-PROOF-03 | `/launch-notes` shows the same content long-form, plus "About this concept" (who built it, when, why), before/after screenshots, the demo video, and the feedback form. | M |
| FR-PROOF-04 | Testing numbers are read from `test_sessions` via `/api/stats` (or a committed JSON snapshot if the DB is unavailable), never hand-typed. | S |

### 11.5 Feedback (FR-FB)
- Form on /launch-notes and /accessibility: message (required, ≤ 1,000 chars), email (optional) with consent checkbox required if email provided, honeypot field, rate limit. Success shown only after the server confirms storage.

### 11.6 Disclosures (FR-DISC)
- Render the §3.6 disclosures whenever `business.mode === "concept"`; hide concept-specific text in partner mode. Rebate disclaimers (FR-REB-15) and the AI label (FR-VIS-08) show in both modes.

### 11.7 Analytics (FR-ANL)
| ID | Requirement | P |
|---|---|---|
| FR-ANL-01 | Vercel Analytics for page views (cookieless). | M |
| FR-ANL-02 | First-party events via `navigator.sendBeacon('/api/events')`, batched; session ID is a random value in `sessionStorage` (no cookies). | M |
| FR-ANL-03 | Allowed events and props (whitelist enforced server-side): `hero_cta_click{cta}`, `estimator_start{path}`, `address_selected{}`, `polygon_completed{count}`, `manual_area_entered{}`, `sample_used{}`, `estimate_shown{city,sqftBucket,rebateBucket,tier}`, `prep_sheet_opened{city}`, `eligibility_started{city}`, `eligibility_result{city,result}`, `visualizer_upload{source}`, `render_success{style,ms}`, `render_failed{style,code}`, `render_downloaded{style}`, `booking_started{}`, `booking_confirmed{city}`, `feedback_sent{}`, `proof_opened{tab}`, `guide_read{slug}`, `headline_variant{v}`, `cta_impression{cta,variant}`, `page_view{path,variant}`. Every event also carries `source` and `variant`. Buckets: sqft by 250; rebate by $500. | M |
| FR-ANL-04 | Test sessions: `/?t=T01&v=a` starts a `test_sessions` row; `estimate_shown` records `first_estimate_at` once. | S |
| FR-ANL-05 | **Source tagging.** On first page load in a tab, read `?src=` (or `utm_source` as an alias) and store it in `sessionStorage` as the session source; default `direct`, or `referral:<hostname>` when `document.referrer` is another site. Every event carries `source`. Allowed values are listed in §11.9; unknown values become `other`. | S |
| FR-ANL-06 | **Click-through events.** `cta_impression{cta,variant}` fires once per page view when the hero primary CTA is ≥ 50% visible (IntersectionObserver); `hero_cta_click{cta,variant}` already exists. Click-through rate = clicks ÷ impressions. | S |
| FR-ANL-07 | `page_view{path,variant}` is also recorded in our `events` table (in addition to Vercel Analytics) so the funnel denominator lives in our database. | S |

---

### 11.8 Growth insights `/insights` (FR-INS)

A public, read-only page that turns the site's own anonymized event data into marketing insight. It is the "back office" of the marketing site, shown in the open because judges cannot log in. Linked from the Proof drawer ("Insights" tab link) and the footer.

| ID | Requirement | P |
|---|---|---|
| FR-INS-01 | No login; anonymized aggregates only; header label "Live data from this site since {INSIGHTS_SINCE}" (default Oct 17, 2026, 9:00 AM Arizona). Time filter chips: Since launch · Today · Last hour. | S |
| FR-INS-02 | **Funnel panel:** sessions → started an estimate (`estimator_start`) → saw a rebate (`estimate_shown`) → previewed a yard (`render_success` or gallery shown) → checked eligibility (`eligibility_result`) → booked (`booking_confirmed`). Counted by unique session. Show count, step conversion % and overall %. Highlight the largest drop-off step. | S |
| FR-INS-03 | **Click-through panel:** hero CTA impressions, clicks and CTR overall and per headline variant (A/B). | S |
| FR-INS-04 | **A/B panel:** for each variant: sessions, CTR, median time to first rebate (from sessions with `estimate_shown`), five-second-test score from `test_sessions` notes (entered by R4). Show "Too little data to call a winner" when either variant has < 20 sessions; never declare a winner below that. | S |
| FR-INS-05 | **Sources panel:** sessions and bookings by source (§11.9), with conversion rate to `estimate_shown`. | S |
| FR-INS-06 | **Audience panel:** estimates by city; median lawn size; median estimated rebate; most-picked tier; style popularity (renders by style). Buckets only, no individual rows. | S |
| FR-INS-07 | **Feature health panel:** render success rate, median render time, gallery fallback share; estimator entry path split (map / manual / sample); map failure count. | S |
| FR-INS-08 | **SEO readiness panel:** from `content/seo-report.json` (generated at build by `scripts/seo-report.ts`): number of indexable routes, % with unique title, % with meta description, % with OG image, JSON-LD types present, sitemap URL count; plus manually maintained `searchConsole{ submittedAt, discoveredPages, indexedPages, checkedAt }`. Never shows rankings, impressions or search CTR (not measurable in 48 hours); a note says so. | S |
| FR-INS-09 | **"What we changed because of data" log:** rendered from `content/decisions.json` (hand-maintained by R4): `{ date, observation, evidence, change, result }`. Only real observations from tests or events. Newest first. | S |
| FR-INS-10 | **Business KPIs explainer:** north star (booked yard walks), leading indicators (estimate completion rate, rebate→booking rate, preview→booking rate), efficiency (cost per booked walk by source, "available once there is ad spend"), quality (share of bookings passing eligibility). | S |
| FR-INS-11 | Small-number honesty: any rate with a denominator < 10 shows "n = {x}, too few to read" instead of a percentage. | S |
| FR-INS-12 | Data via `GET /api/insights?since=` (cached 30 s); charts are simple accessible bars/tables (no heavy chart library; each chart has a data table alternative). | S |
| FR-INS-13 | Exclude our own team's sessions: a `?team=1` link sets `sessionStorage.ss_team=1`, and those events carry `team:true` and are excluded from insights (but still count on /live if desired). | S |

### 11.9 Source tagging scheme (FR-ANL-05)

| `src` value | Where the link is used |
|---|---|
| `qr-pitch` | QR code on the final pitch screen and on `/live` |
| `qr-table` | Printed QR card on our table |
| `linkedin` | Team LinkedIn launch posts |
| `x` | Posts on X |
| `discord` | Ship AI Discord |
| `test` | User-testing links (with `t=` and `v=`) |
| `submission` | The URL in the hackathon submission form |
| `direct` | No parameter, no referrer |
| `referral:<host>` | Any other referring site |

Example: `https://<site>/?src=qr-pitch&v=a`. Rules: every link the team shares is tagged; `src` is stripped from the address bar after reading (history.replaceState) so shared URLs stay clean.

## 12. Component state matrix

Every interactive component must implement **all** states below. Agents check this table before marking UI work done.

| Component | Idle/empty | Loading | Success | Error | Other |
|---|---|---|---|---|---|
| Address search | Placeholder "Start typing your address" | Spinner in field | Suggestions list (max 5) | "Can't search addresses right now. Enter square footage instead." | No results: "No match in the Phoenix area" |
| Map | Phoenix overview + hint | Skeleton with reserved height | Satellite + outline tools | Map unavailable card (FR-EST-13) | Reduced motion: no fly animation |
| Drawing | Hint overlay | n/a | Live area label | Self-intersection message | Too small / too large warnings |
| Rebate result | "Your rebate appears here" | n/a (instant) | Amount + notes | Blocker card | Closed/unknown status variants |
| Eligibility | Intro + start | n/a | Result screen (3 variants) | n/a | Back navigation preserves answers |
| Visualizer upload | Drop zone + sample options | Preprocessing indicator | Thumbnail + style picker | Unsupported file / too large | Camera permission denied |
| Render | n/a | Staged progress + cancel | Slider | Fallback example + message | Slow (> 25 s) notice |
| Booking | Picker | Submitting (button busy) | Redirect | "Couldn't book. Try again." | Unavailable slots |
| Notification preview | n/a | "Sending…" | "Sent to the crew's phone" | "Not delivered (email sent)" / "Not delivered" | |
| Feedback | Empty form | Submitting | "Thanks, received." | Validation + server error | Rate limited |
| Live board | Zero state "Waiting for the first estimate" | Initial skeleton | Counters | Stale indicator | |
| Insights panels | "No data yet for this period" | Skeleton per panel | Charts + tables | "Couldn't load insights. Showing last snapshot." | n < 10 honesty label |
| Proof drawer | Tabs | Lazy tab content skeleton | Content | "Couldn't load live numbers; showing last snapshot." | |

---

## 13. Data models

### 13.1 Database (Postgres via Drizzle)
```ts
// db/schema.ts (indicative; types are Drizzle pg-core)
estimates {
  id: uuid pk default gen_random_uuid()
  created_at: timestamptz not null default now()
  city: text not null                 // phoenix|mesa|chandler|scottsdale|tempe|gilbert|glendale|other
  program_id: text null
  program_status: text null           // open|unknown|closed
  sqft: integer not null check (sqft >= 0 and sqft <= 50000)
  source: text not null               // map|manual|sample
  shape_count: smallint not null default 0
  tier: text not null                 // essentials|signature|showcase
  trees: smallint not null default 0
  rebate_amount: integer null         // whole dollars
  rebate_blocked: boolean not null default false
  project_low: integer not null
  project_high: integer not null
  net_low: integer not null
  net_high: integer not null
  water_gal_year: integer not null
  test_session_id: uuid null references test_sessions(id)
}
renders {
  id: uuid pk; created_at: timestamptz
  style: text not null; provider: text not null
  status: text not null               // success|failed|timeout|fallback|refused
  duration_ms: integer null; error_code: text null
  test_session_id: uuid null
}
eligibility_checks {
  id: uuid pk; created_at: timestamptz
  program_id: text not null; result: text not null   // likely|not_eligible|check_city
  reason_codes: text[] not null default '{}'
}
bookings {
  id: uuid pk; created_at: timestamptz
  slot_date: date not null; slot_window: text not null   // morning|afternoon
  city: text not null; estimate_id: uuid null references estimates(id)
  mode: text not null                 // concept|partner
  status: text not null default 'demo'   // demo|requested|cancelled
  notified: boolean not null default false
  idempotency_key: text unique not null
  // partner mode only (nullable): first_name, phone, email, consent
}
events {
  id: bigserial pk; created_at: timestamptz
  name: text not null; props: jsonb not null default '{}'
  path: text null; session_id: text null
  source: text not null default 'direct'; variant: text null; team: boolean not null default false
}
feedback {
  id: uuid pk; created_at: timestamptz
  message: text not null check (char_length(message) <= 1000)
  email: text null; consent: boolean not null default false; page: text null
}
test_sessions {
  id: uuid pk; created_at: timestamptz
  tester_label: text not null; variant: text not null     // a|b
  first_estimate_at: timestamptz null; completed: boolean not null default false
  notes: text null
}
rate_limits {
  ip_hash: text not null; window_start: timestamptz not null; route: text not null
  count: integer not null default 0
  primary key (ip_hash, route, window_start)
}
```
Indexes: `estimates(created_at)`, `events(name, created_at)`, `events(session_id)`, `events(source)`, `renders(created_at)`, `bookings(created_at)`.
Retention: delete `events` older than 30 days (manual script; not needed for the hackathon).

### 13.2 Content files (validated with Zod in `lib/content/schema.ts`)
| File | Shape (summary) |
|---|---|
| `content/business.json` | `{ name, mode, tagline, shortDescription, promise, promiseGuarantee, hours, serviceCities[], rebateCities[], disclosures{...}, waterEstimate{galPerSqftYear, derivation, sourceUrl}, seasonal{...}, social{} }` |
| `content/rebate-programs.json` | `{ programs: [{ id, city, name, status, type: "per_sqft"|"tiered"|"status_only", ratePerSqft?, roundingIncrementSqft?, tiers?[{minSqft, maxSqft?, amount}], treeBonus?{perTree, maxTrees}, minimumSqft?, maximumAmount?, caseByCaseAboveSqft?, minimumWaiver?, approval{required, name, reviewTime?, completeWithin}, healthyGrassMinPercent?, eligibility[], prohibitions[], documents[], payment, howToApply, sourceUrl, lastVerified, notes[] }], eligibilityQuestions: { [programId]: Question[] } }` |
| `content/pricing.json` | `{ tiers: [{ id, name, lowPerSqft, highPerSqft, includes[], featured }], minimumProject, caption }` |
| `content/styles.json` | `{ styles: [{ slug, name, tagline, description, mood[], materials, plantsPrompt, plantIds[], maintenance, swatches[], sampleBefore, sampleAfter }] }` |
| `content/plants.json` | `{ plants: [{ id, common, botanical, type, sun[], matureSize, bloom, flowerColor?, pollinator, styles[], note, featured }] , listSourceUrl }` |
| `content/decisions.json` | `{ entries: [{ date, observation, evidence, change, result? }] }` (hand-maintained, real data only) |
| `content/seo-report.json` | `{ generatedAt, routes, withTitle, withDescription, withOg, jsonLdTypes[], sitemapUrls, searchConsole{ submittedAt?, discoveredPages?, indexedPages?, checkedAt? } }` |
| `content/timeline.json` | `{ generatedAt, entries: [{ date, hash, title, type }] }` (generated by `pnpm timeline`) |
| `content/guides/*.mdx` | Frontmatter: `title, description, updated, sources[], related[]` |

---

## 14. API specification

All routes are Next.js Route Handlers under `app/api/`. JSON responses use the envelope `{ ok: true, data } | { ok: false, error: { code, message } }`. Inputs validated with Zod. Rate limits via a Postgres `rate_limits` table (per IP hash); exceeded → 429 `RATE_LIMITED`.

| Method & path | Request | Response `data` | Errors | Rate limit |
|---|---|---|---|---|
| `POST /api/estimates` | `{ city, sqft, source, shapeCount, tier, trees?, testSessionId? }` | Full recomputed estimate `{ id, rebate: RebateResult, project, net, waterGalYear }` | `INVALID_INPUT` (400) | 30/min |
| `POST /api/render` | multipart: `image` (≤ 4 MB after client preprocess), `style` | `{ renderId, imageBase64, mime, provider, durationMs }` | `INVALID_IMAGE` (400), `PROVIDER_REFUSED` (422), `PROVIDER_TIMEOUT` (504), `PROVIDER_ERROR` (502), `DAILY_CAP` (429) | 5 per 10 min per IP; global `RENDER_DAILY_CAP` |
| `POST /api/eligibility` | `{ programId, result, reasonCodes[] }` | `{ id }` | `INVALID_INPUT` | 30/min |
| `POST /api/bookings` | `{ slotDate, slotWindow, city, estimateId?, idempotencyKey, partner?{...} }` | `{ id, notified, channel }` | `SLOT_UNAVAILABLE` (409), `INVALID_INPUT` | 10/min |
| `GET /api/bookings/[id]` | — | Booking summary (no partner PII) | `NOT_FOUND` (404) | 60/min |
| `POST /api/feedback` | `{ message, email?, consent, page, hp }` | `{ id }` | `INVALID_INPUT`, `SPAM` (silently 200 for honeypot) | 5/10 min |
| `POST /api/events` | `{ events: [{ name, props, path, sessionId, ts }] }` (≤ 20) | `{ accepted }` | Unknown names dropped silently | 120/min |
| `GET /api/stats?since=ISO` | — | `{ estimates, sqft, rebateDollars, renders, bookings, byCity{}, recent[], testing{ testers, medianMsToEstimate, completionRate, variantResults } }` | — | Cached 5 s (`s-maxage=5`) |
| `GET /api/insights?since=ISO` | — | `{ funnel[], cta{impressions,clicks,byVariant}, ab{a,b}, sources[], audience{byCity,medianSqft,medianRebate,tiers,styles}, health{renderSuccessRate,medianRenderMs,galleryShare,entryPaths,mapFailures} }` (team sessions excluded) | — | Cached 30 s |
| `GET /api/og` | `?title=&subtitle=&kind=` | PNG 1200×630 (edge runtime) | — | CDN cached |
| `GET /api/health` | — | `{ db, imageProvider, push }` booleans | — | — |

Server-side recompute: `/api/estimates` ignores client-sent amounts and recomputes with the same engine.

---

## 15. Site-wide behavior

### 15.1 Modes
`business.mode` (`concept` | `partner`) toggles disclosures, booking fields, structured data type and copy variants. Default `concept`.

### 15.2 Theme
Light theme only (landscape photography and print-friendly pages). `/live` uses a dark variant. Respect `prefers-reduced-motion` and `prefers-contrast` (thicker borders).

### 15.3 Responsiveness
Breakpoints: 375 (base), 768 (md), 1024 (lg), 1280 (xl), 1440 (max container 1200 px + gutters). Test 320 for overflow. No horizontal scroll at any width.

### 15.4 Performance budgets
Home JS ≤ 120 KB gzipped on first load; map and visualizer code split and loaded on demand; images AVIF/WebP via `next/image`; fonts subset and `display: swap`; static pages rendered at build (SSG); rebate pages SSG from content.

### 15.5 Caching
Static pages: SSG. `/api/stats`: `s-maxage=5`. OG images: immutable per query. No caching of POST routes.

### 15.6 SEO technical (FR-SEO)
| ID | Requirement |
|---|---|
| FR-SEO-01 | `metadata` per route (title, description, canonical, OG, Twitter card). |
| FR-SEO-02 | `sitemap.xml` and `robots.txt` generated; exclude `/live`, `/book/confirmed/*`, `/studio/prep`. |
| FR-SEO-03 | JSON-LD per §4.5; validate with Google's Rich Results Test. |
| FR-SEO-04 | Dynamic OG images (`/api/og`) with page title on a desert background and the wordmark. |
| FR-SEO-05 | Favicon set, apple-touch-icon, `theme-color`, web manifest. |
| FR-SEO-06 | Optional `llms.txt` summarizing the business, pages and data sources. |

### 15.7 Accessibility
WCAG 2.2 AA. Skip link; landmarks; one H1; focus visible (2 px outline, offset 2 px, token `--focus`); all controls labeled; slider and map tools keyboard-operable (map drawing alternative: manual entry path satisfies equivalence); `aria-live="polite"` for results; error messages tied to inputs with `aria-describedby`.

### 15.8 Privacy
Statement must say: what we collect (city, lawn area, chosen options, anonymous events, optional feedback email with consent); what we don't (names, phone numbers, addresses, coordinates, photos in concept mode); processors (Vercel hosting/analytics, database provider, Mapbox for maps and address search, the image provider for previews, ntfy for notifications); no cookies for tracking; how to contact (feedback form).

### 15.9 Security
CSP (default-src 'self'; img-src self data: blob: Mapbox domains; connect-src self Mapbox; frame-ancestors 'none'); HSTS; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; Mapbox public token URL-restricted to our domains; server keys only in Vercel env; request size limits; IP addresses hashed (SHA-256 + salt) for rate limiting, never stored raw.

### 15.10 Error handling
Global error boundary page with "Something went wrong. Your estimate is still in the link above." and Home link; API errors per §14; user-facing copy never shows codes except a short reference ID.

---

## 16. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-01 | Lighthouse mobile scores (home, /studio, /rebates/phoenix) | ≥ 95 in all four categories |
| NFR-PERF-02 | LCP / CLS / INP (mobile) | < 2.5 s / < 0.05 / < 200 ms |
| NFR-PERF-03 | Estimator recompute | < 50 ms |
| NFR-PERF-04 | Render round trip (p50) | < 20 s; hard timeout 45 s client |
| NFR-A11Y-01 | axe serious/critical violations | 0 |
| NFR-REL-01 | Every network feature has a working offline-safe fallback | 100% |
| NFR-REL-02 | Demo replay: `?demo=1` uses mock providers and seeded data | Works with Wi-Fi off after first load |
| NFR-SEC-01 | Secrets in browser bundle | 0 (CI grep check) |
| NFR-PRIV-01 | PII in DB/logs (concept mode) | 0 |
| NFR-MAINT-01 | Content changes without code changes | Rebates, pricing, styles, plants, copy blocks |
| NFR-COST-01 | Infrastructure cost | **$0**: no payment method on any account; every free-tier limit has a fallback (ARCH §10) |
| NFR-COMP-01 | Browsers | Last 2 versions of Chrome, Safari, Firefox, Edge; iOS Safari 16+ |

---

## 17. Acceptance and traceability

| Rubric target (`HACKATHON.md`) | Satisfied by |
|---|---|
| D1 five-second test | FR-HOME-01, CONTENT hero copy |
| D2 one primary CTA | §4.3, DESIGN_SYSTEM buttons |
| D4/D5 time to rebate | FR-HOME-02, FR-EST-01, FR-EST-10 |
| C1–C4 performance | NFR-PERF-01/02, §15.4 |
| C7 accessibility | §15.7, NFR-A11Y-01 |
| C8 states | §12 |
| C12 share previews | FR-SEO-01/04 |
| RC2 routes | §5.1 |
| RC3 features | §8, §7, §9, §10, §11.1–11.3 |
| RC4 timeline | FR-PROOF-02, AGENTS §6 |
| RC5 user tests | FR-ANL-04, FR-PROOF-04 |
| RC6 sourced rebates | FR-REB-04, §7.3 |
| RC11 growth insights | FR-INS-01–13, FR-ANL-05–07 |

**Release gate (Sunday 10:30 AM):** all M requirements pass; all §7.5 tests green; e2e suite green with mocks; Lighthouse targets met; disclosures verified; private-window test passed.

---

## 18. Out of scope
Accounts and logins; payments; real scheduling or CRM integration; storing photos; chatbot; multi-language (Spanish is a possible C item only if everything else is done); dark mode for the main site; native apps; admin dashboard (data reviewed in the database console).

---

## 19. Open items and items to verify (`TODO(VERIFY)`)
1. Program funding status for Phoenix, Mesa and Chandler (pages don't state it). Call or email before Saturday if possible; otherwise show `unknown` status copy.
2. Scottsdale's 2026 relaunch date and rules.
3. Map provider pricing, free-tier limits, satellite style name and attribution requirements (Mapbox).
4. Image provider model name, pricing, latency and editing quality (run the 15-minute test in PHASES Phase 3).
5. Plant list entries against the ADWR Phoenix AMA Low-Water-Use/Drought-Tolerant Plant List.
6. Sample yard photos: must be photos we take ourselves (e.g., a teammate's or a public park lawn we photograph) or properly licensed; no recognizable people, house numbers or license plates.
7. Domain availability for "sonoranswap" variants; check for brand conflicts before any promotion.
8. Scoring scale (0–10 vs 1–5) and Crowd Favorite award (HACKATHON §8).
