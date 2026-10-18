# DESIGN_SYSTEM.md: Sonoran Swap

> The design judge will notice a default template look immediately. Every component uses these tokens. shadcn/ui is for behavior and accessibility only; restyle everything.

## 1. Brand idea
**Lawn to Sonoran.** The site should feel like a calm, premium local landscape studio: warm earth, sun-bleached stone, deep desert greens, generous whitespace, real textures. Not a tech startup. Not a cartoon cactus.

Mood words: sun-warmed, grounded, crafted, honest, unhurried.

## 2. Color tokens
All text pairs below meet WCAG AA (ratios computed).

| Token | Hex | Use | Contrast note |
|---|---|---|---|
| `--color-caliche` | `#F6F1E7` | Page background | — |
| `--color-sand` | `#EADFC9` | Section bands, cards on caliche | Ink on sand 11.9:1 |
| `--color-ink` | `#1F2421` | Body text | 14.0:1 on caliche |
| `--color-ink-muted` | `#5C6159` | Secondary text, captions | 5.6:1 on caliche |
| `--color-saguaro` | `#2F4A35` | Headings, dark bands, footer background | 8.7:1 on caliche; white on saguaro 9.8:1 |
| `--color-terracotta` | `#A4471F` | **Primary buttons**, key numbers, links | White on terracotta 6.0:1; terracotta on caliche 5.3:1 |
| `--color-palo-verde` | `#8FA650` | Decorative accents, chart fills, illustrations | Ink on palo verde 5.8:1; never white text on it |
| `--color-dusk` | `#6E8CA6` | Decorative sky accents | Decorative only |
| `--color-success` | `#2F7D4F` | Eligible, sent | White on success 5.0:1 |
| `--color-warning` | `#8A5A0A` | Warnings (text) on caliche | 5.3:1 |
| `--color-warning-bg` | `#FBEFD9` | Warning card background | — |
| `--color-error` | `#B42318` | Errors, blockers | 5.8:1 on caliche |
| `--color-line` | `#DDD3C0` | Borders, dividers | — |
| `--focus` | `#A4471F` | Focus ring (2 px, offset 2 px) | — |

`/live` dark variant: background `#1B241E`, text `#F6F1E7`, accent terracotta lightened to `#D9774C` for large numerals only.

## 3. Typography
| Token | Value |
|---|---|
| Display font | **Fraunces** (Google Fonts, variable, opsz), weights 500–700, for H1–H3 and big numbers |
| Body font | **Inter** (variable), 400/500/600 |
| Numbers | Inter with `font-variant-numeric: tabular-nums` for money, sq ft, counters |
| Base size | 16 px, line-height 1.6 body, 1.15 display |
| Scale | 12 / 14 / 16 / 18 / 20 / 24 / 30 / 38 / 48 / 64 px |
| H1 | 64 desktop / 40 mobile, Fraunces 600, letter-spacing −0.02em, max 14 words |
| H2 | 38 / 30, Fraunces 600 |
| H3 | 24 / 20, Fraunces 500 |
| Eyebrow | 12–13 px Inter 600, uppercase, tracking 0.08em, terracotta |
| Line length | 60–72 characters for body copy |

Load via `next/font/google` with `display: "swap"` and Latin subset.

## 4. Spacing, layout and shape
- **8-point grid:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Section padding:** 96 desktop / 64 mobile vertical.
- **Container:** max 1200 px, 24 px gutters (16 px on mobile).
- **Grid:** 12 columns desktop, 4 columns mobile.
- **Radius:** 6 px inputs, 12 px cards, 20 px media, 999 px pills.
- **Elevation:** one shadow level `0 1px 2px rgba(31,36,33,.06), 0 8px 24px rgba(31,36,33,.06)`; borders (`--color-line`) do most of the work.
- **Texture:** subtle paper/grain texture (SVG noise at 3% opacity) on caliche backgrounds; never behind body text blocks at high opacity.

## 5. Imagery
- Sample yards: no freely licensed photos of a typical Phoenix front lawn were found, so (team decision, Oct 15) the three sample "before" photos are AI-generated and labeled "AI-generated sample yard. Not a real home." Pre-rendered results come from our own pipeline and carry the AI label. A team photo of a real lawn may replace a sample later.
- Illustrations: simple line icons (Lucide) at 1.5 px stroke; custom desert pictograms optional.
- No stock photos of smiling people. No fake team photos.
- All images have meaningful alt text; decorative images use empty alt.

## 6. Components (all restyled)

| Component | Spec |
|---|---|
| **Button (primary)** | Terracotta bg, white text, 48 px height (44 min), 20 px horizontal padding, radius 999, Inter 600 16 px; hover darken 6%; active scale .98; focus ring; loading state with spinner and `aria-busy` |
| **Button (secondary)** | Transparent, saguaro text, 1.5 px saguaro border |
| **Link (inline)** | Terracotta, underline offset 3 px, thickness 1.5 px |
| **Input / Select** | 48 px height, caliche-white `#FFFDF8` bg, line border, 6 px radius; error state border `--color-error` + message below |
| **Card** | Sand or white bg, 12 px radius, 24 px padding, line border |
| **Stat** | Fraunces number 48 px + Inter label 14 px muted |
| **Money** | Always `$` + thousands separators, whole dollars; ranges with en dash: `$9,600 – $15,600` |
| **Notes list** | Icons by kind: info (circle-i, ink-muted), warning (triangle, warning), blocker (octagon, error); text 15 px |
| **Approval band** | Saguaro background, caliche text, large Fraunces line, icon of a stamped document |
| **Compare slider** | Full-bleed media, 3 px caliche divider with 44 px circular handle (terracotta ring), labels "Before" / "After" pills; keyboard support |
| **Map tools** | Floating toolbar (white, 12 px radius) with Outline, Undo, Delete, Recenter; live area pill near the cursor/last point |
| **Results panel** | Sticky on desktop; big rebate number (Fraunces 48–64 px, terracotta), basis line muted, notes, tier segmented control, ranges, actions |
| **Segmented control** | For tiers and Before/After/Compare; 44 px height |
| **Accordion** | FAQ; chevron rotates; 56 px rows |
| **Drawer** | Proof drawer, 440 px desktop, full-screen sheet mobile |
| **Toast** | Bottom center, 4 s, aria-live polite |
| **Badge** | Concept badge: sand bg, ink text, 12 px pill, small dot |
| **Source note** | 13 px muted: "Source: City of Phoenix · checked Oct 15, 2026 ↗" |
| **AI label** | Small pill over image bottom-left: "AI concept rendering" |
| **Skeleton** | Sand shimmer (disabled with reduced motion) |

## 7. Motion
- Durations 150–250 ms; ease-out `cubic-bezier(.2,.8,.2,1)`.
- Count-up for numbers 200 ms; map fly-to 1.2 s; slider follows pointer without easing.
- Hero before/after: on load, the divider glides from 85% to 50% once (600 ms), then stops. Disabled for reduced motion.
- No parallax, no autoplay video, no infinite animations except loading indicators.

## 8. Page rhythm (home)
Alternate backgrounds: caliche → sand band → caliche → saguaro (promise band) → caliche → sand (pricing) → caliche → footer saguaro. Each section: eyebrow, H2, one-sentence lead, content, one action.

## 9. Responsive rules
- Hero stacks at < 1024 px: text first, slider second, quick estimate below.
- Studio: split view ≥ 1024; stepper below.
- Tables become stacked cards < 768 px.
- Minimum tap target 44 × 44; no hover-only info (tooltips also open on tap and focus).

## 10. Accessibility reminders
- Color is never the only signal (icons + text for statuses).
- Focus visible on all interactive elements.
- Text resizes to 200% without loss.
- Motion respects `prefers-reduced-motion`.
