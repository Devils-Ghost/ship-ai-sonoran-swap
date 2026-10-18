# HACKATHON.md: Rules, Rubric and Submission

> **Read this before building anything.** This file describes the contest we are entering, the rules we must obey, how we are scored, and the measurable targets we hold ourselves to. If anything in another document conflicts with this file, this file wins.
>
> Last verified: **Thursday, October 15, 2026** against the public event pages and the organizer's Discord answers. Re-check the official pages on Saturday morning.

---

## 1. The event

| Item | Detail |
|---|---|
| Name | **Ship AI AZ GTM Hackathon** (part of Ship AI's free *Zero to Launch* program). GTM = go-to-market. |
| Organizers | Presented by **Ship AI**. Hosted and sponsored by **Workuity**. Listed host: Dan Kite. |
| Task | "Build and ship the best marketing site." |
| Venue | Workuity Biltmore (24th St & Camelback), 2390 E Camelback Rd, Suite 130, Phoenix, AZ 85016. A coworking space, **not** the Arizona Biltmore resort. Free parking in the surface lot. In person. |
| Saturday, Oct 17 | 9:00 AM – 5:00 PM (Arizona time): meet teams, on-site sessions, build and launch. |
| Sunday, Oct 18 | 9:00 AM – 2:00 PM: finish; **submit by 12:00 PM (noon)**; recorded pitches from **12:15 PM**; awards at **1:30 PM**. |
| Team size | 1–4 people. We are 4. One submission per team. |
| Cost | Free. |
| Prizes | $1,000 prize pool (split not published); certificate for every submitter; a recorded pitch; employers and business professionals attending. |
| Venue contact | Workuity Biltmore (602) 761-9675, info@workuity.com |
| Links | Event: workuity.com/events/arizona-ai-hackathon-2026-10-17-biltmore/ · Hackathon: shipai.club/programs/zero-to-launch/hackathon · Submit: shipai.club/programs/zero-to-launch/hackathon/submit · Questions: Ship AI Discord (before the deadline) |

Arizona does not observe daylight saving time. "MST" on the submit page and "Arizona time" mean the same clock (UTC−7).

## 2. Hard rules (non-negotiable)

These come from the official pages and the organizer. Breaking any of them can disqualify us or cost points.

| # | Rule | Source | What it means for us |
|---|---|---|---|
| R1 | **Submit by 12:00 PM Sunday, Oct 18. No late submissions.** | Submit page | We submit at **11:30 AM**. Code freeze at 10:30 AM. |
| R2 | The live marketing-site URL must open for anyone **without signing in**; check it in a private window. | Submit page | No auth walls, no Vercel preview protection, no password. Test in incognito on two devices. |
| R3 | One submission per team; 1–4 members. | Submit page | One owner submits; everyone can edit the draft. |
| R4 | New and existing projects welcome; explain what changed during the weekend. | Hackathon + submit pages | Pre-weekend planning and scaffolding are allowed. Be honest in "What you shipped." Keep dated commits. |
| R5 | Any tools, any stack. You keep your IP. | Hackathon page | AI coding agents are allowed. |
| R6 | It is meant to be **a marketing site for a business**. The business can be real or fictional. | Organizer (Santos) in Discord | Sonoran Swap is a concept business. The website is the deliverable, not a SaaS tool. |
| R7 | Judged on **Design, Craft, Receipts**, equal weight. | Hackathon + submit pages, organizer | Every decision must serve at least one axis without hurting another. |
| R8 | Traffic, signups and revenue are **not required** as receipts. | Submit page | Never fake metrics. Receipts are evidence of what we shipped. |
| R9 | Recorded pitch at 12:15 PM; be ready to show shipped pages, features and evidence. | Hackathon + submit pages | A rehearsed 60-second and 3-minute pitch, plus a backup video. |
| R10 | Sign-in to the submission form is email plus a six-digit code; drafts can be saved and edited by any member until the deadline. | Submit page | Create the draft **Saturday evening**; update it Sunday morning. |

## 3. How we are scored

### 3.1 The three axes (official wording, verbatim)

| Axis | Official description |
|---|---|
| **Design** | "Make your site clear, useful, and easy to navigate." |
| **Craft** | "Polish the details. Make it work well on every screen." |
| **Receipts** | "Show the amount you shipped: live pages, working features, and a real URL." |

### 3.2 Scale (there is a known inconsistency)

- The **submit page** says each criterion is scored **0–10**, weighted equally.
- The **organizer** said in Discord: rated **1–5** (5 best), equal weight, **scores totaled across judges**.
- Either way: **three equal axes, three judges, totals compared.** Maximum is 90 (0–10 scale) or 45 (1–5 scale).
- **Action:** ask in Discord or at Saturday kickoff which scale is final. It doesn't change the build; it does change how we talk about targets.

Because scores cluster near the top, **the winner is the entry with no weak axis that the judges also remember.** A 10/10/6 loses to 9/9/9.

### 3.3 Awards

- **Best Marketing Site** (judged).
- **Crowd Favorite** (voted by the room after pitches). This award came from our earlier notes; it is **not shown on the current public pages. Confirm at kickoff.**
- A team may be able to win both. Split of the $1,000 pool is not published.

### 3.4 The judges and what each rewards

| Judge | Background (public) | Rewards | How Sonoran Swap scores with them |
|---|---|---|---|
| **Santos Hernandez** | Founder of Ship AI; founder of ggbucks; cofounder of desic. Taught the Zero to Launch sessions on positioning, the 60-second pitch and "Ship the Surface." | Sharp positioning, one clear call to action, real numbers, claims backed by evidence, value before the ask. | One-liner a stranger repeats; real public rebate math; honest receipts with dates. |
| **Jon Schack** | Founder and "Chief Intern," AutomationInterns.com (Tempe); AI automation for Phoenix small businesses. | A concrete local-business workflow that could be sold to a Phoenix company next week. | Measure → rebate → design → approval → install: a real landscaper's workflow, automated. |
| **Raj Shah** | Design engineer, RSS Design; runs Ship AI design office hours on design systems. | Hierarchy, typography, spacing, a coherent design system, responsive polish, interaction detail. | A custom desert design system; the before/after slider; flawless mobile. |

Sponsors (no sponsor tracks or prizes): Workuity (Platinum), desic and AutomationInterns.com (Gold), CEI Gateway (Silver). **Do not put sponsor names or logos on the site.**

## 4. Our measurable targets (the internal rubric)

These are **our** targets, not official ones. Each is testable, and each maps to an axis. A phase is not done until its targets pass.

### 4.1 Design (clear, useful, easy to navigate)

| ID | Metric | Target | How we test |
|---|---|---|---|
| D1 | Five-second test: a tester shown the hero for 5 s can say who it's for and what it does | ≥ 4 of 5 testers | Saturday user tests |
| D2 | Primary calls to action per viewport | Exactly 1 primary; secondary visually subordinate | Design review at 375 and 1440 px |
| D3 | Top-level navigation items | ≤ 6 (plus the CTA) | Inspect |
| D4 | Time from landing to seeing a rebate number (sample yard path) | Median < 30 s | Timed tests |
| D5 | Time from landing to a rebate number using your own address | Median < 90 s | Timed tests |
| D6 | Every page has one H1, a clear next step, and is reachable in ≤ 2 clicks from home | 100% of pages | Route audit |
| D7 | Copy reading level of hero and key pages | Plain language; no jargon without explanation | Review |

### 4.2 Craft (polish; every screen)

| ID | Metric | Target | How we test |
|---|---|---|---|
| C1 | Lighthouse **mobile**: Performance, Accessibility, Best Practices, SEO | **≥ 95** each on home, /studio, /rebates/phoenix | Lighthouse in Chrome, incognito, saved reports |
| C2 | Largest Contentful Paint (mobile) | < 2.5 s | Lighthouse / PageSpeed |
| C3 | Cumulative Layout Shift | < 0.05 | Lighthouse |
| C4 | Interaction to Next Paint | < 200 ms | PageSpeed field/lab |
| C5 | Breakpoints verified | 320, 375, 768, 1024, 1440 px; no horizontal scroll | Manual + Playwright screenshots |
| C6 | Browser console errors on any route | 0 | Manual + Playwright |
| C7 | axe accessibility violations (serious or critical) | 0 | axe DevTools / @axe-core/playwright |
| C8 | Every interactive component has designed loading, empty, error and success states | 100% | State checklist in SRS §12 |
| C9 | Tap targets | ≥ 44 × 44 px | Review |
| C10 | Keyboard: whole journey without a mouse; visible focus | Pass | Manual |
| C11 | Typos, placeholder text, lorem ipsum, broken links | 0 | Review + link checker |
| C12 | Share previews (OG image, title, description) render in iMessage, LinkedIn, Slack, X | 4 of 4 | Manual paste test |

### 4.3 Receipts (amount shipped: live pages, working features, real URL)

| ID | Metric | Target | Evidence location |
|---|---|---|---|
| RC1 | Live URL over HTTPS (free `*.vercel.app` is fine; custom domain optional), opens in private window without login | Yes | Submission + footer |
| RC2 | Live, indexable routes | ≥ 18 | sitemap.xml, /launch-notes |
| RC3 | Working interactive features | ≥ 5: lawn measurer, rebate engine, eligibility check, AI yard visualizer, booking with live notification (+ /live board) | /launch-notes, demo |
| RC4 | Dated build timeline entries | ≥ 15, starting Oct 15 | Proof drawer |
| RC5 | Real user-test sessions at the event | ≥ 10 testers; publish median time-to-rebate and completion rate | Proof drawer |
| RC6 | Rebate rules sourced and dated | 100% of rebate figures link to the official city page with "last checked" date | /rebates pages |
| RC7 | Quality reports saved | Lighthouse/PageSpeed before-and-after, dated | Proof drawer |
| RC8 | Before/after evidence | Screenshot set: Friday vs Sunday; visualizer before/after | /launch-notes |
| RC9 | Demo video | 45–60 s, recorded Saturday night | /launch-notes, backup |
| RC10 | Honest limits list | Published | /launch-notes |
| RC11 | Public growth insights page with real funnel, click-through, A/B, source and audience data, plus a dated "what we changed because of data" log | Live by Sat 5 PM; ≥ 2 data-driven changes logged by Sun 10:30 AM | /insights |
| RC12 | Every shared link tagged with `?src=`; sitemap submitted to Google Search Console | 100% of shared links; submitted Friday | /insights (sources, SEO readiness) |

## 5. Integrity rules (receipts that would backfire)

1. **No invented people, reviews, testimonials, ratings, logos, licenses, awards, years in business or customer counts.**
2. **No fake counters** (e.g., "1,200 yards swapped"). Live counters show only real events from our database, labeled as what they are ("estimates run on this site").
3. **Concept disclosure:** Sonoran Swap is a concept business. Disclose it in the nav badge, the booking confirmation, the footer and the privacy page, plus price captions ("Illustrative concept pricing").
4. **Rebate facts are real public information:** always attribute to the city, link the source, show "last checked" date, and say "Eligibility and payment are decided by the City. Sonoran Swap is not affiliated with any city."
5. **AI images are labeled** "AI concept rendering. Actual results vary."
6. **Tester quotes** only with permission, labeled "tester feedback."
7. Never present "interested" as "signed," a tester as a customer, or a concept as a real company.

## 6. Submission form: fields and our drafts

| Field | Required | Our draft (update numbers Sunday morning) |
|---|---|---|
| Project name | Yes | **Sonoran Swap** |
| Live marketing site URL | Yes | `https://<our-project>.vercel.app` (or a free custom domain; verified in a private window) |
| What the site is for | No (fill it) | Sonoran Swap is a (concept) Phoenix desert-landscaping company that converts grass lawns to water-wise desert yards. The site lets homeowners measure their lawn on a satellite map, see the city rebate they qualify for (Phoenix, Mesa, Chandler rules), preview an AI redesign of their own yard, check eligibility before removing anything, and book a free yard walk. |
| What you shipped | No (fill it) | List routes and features shipped during the weekend; state what existed before Saturday (planning docs, scaffold, design tokens). Use the /launch-notes timeline. |
| Receipts | Yes | Links: /studio (measurer + rebate), /visualize, /rebates/phoenix, /insights (funnel, A/B, sources, data-driven changes), /live, /launch-notes (timeline, Lighthouse reports, test results, limits), demo video link, before/after screenshots. |
| Repository URL | No | Public GitHub repo link (recommended: shows dated commits and constraints). Remove secrets first. |

## 7. Pitch requirements (12:15 PM, recorded)

- Prepare **60-second** and **3-minute** versions (length not published; confirm at kickoff).
- Structure (what the judges teach): customer → what they do today → outcome → evidence → one-liner.
- Live demo with a **backup video** on two devices. Never show a terminal or error page.
- Script lives in `docs/PHASES.md` §Phase 8 and `docs/CONTENT.md` §Pitch.

## 8. Questions to confirm with organizers (Discord today; kickoff Saturday)

1. Final scoring scale: 0–10 (submit page) or 1–5 (Discord)?
2. Is Crowd Favorite still an award? How is the $1,000 split?
3. Pitch length and format; can we demo live, including a live photo of the venue?
4. Can we run quick user tests with attendees on Saturday?
5. Does pre-Saturday work count, given "What you shipped" asks about the weekend?

## 9. Pre-submission checklist (Sunday by 11:30 AM)

- [ ] URL opens in a private window on phone and laptop; no login; HTTPS; no console errors.
- [ ] All targets in §4 checked; Lighthouse reports saved with dates.
- [ ] Disclosures present (§5.3); every rebate figure attributed and dated.
- [ ] Measurer, rebate, eligibility, visualizer, booking and push notification all work end to end; fallbacks tested with providers disabled.
- [ ] /launch-notes updated: timeline, test results, limits, before/after, video.
- [ ] Submission fields filled from §6; confirmation screenshotted.
- [ ] Notification phone charged; hotspot; QR code printed; backup video on two devices.
