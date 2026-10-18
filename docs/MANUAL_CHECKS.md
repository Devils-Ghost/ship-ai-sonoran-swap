# MANUAL_CHECKS.md: Things only a human can do

> One list of every check that needs a phone, a dashboard, a real person or a production write. Agents append to it as they go; humans tick items off. Grouped by when it makes sense to do them. Each item says where it comes from.

Last updated: **Fri Oct 16, 2026** (start of Phase 6).

## A. Accounts and dashboards (any time, ideally first)

- [ ] **Mapbox token** (PROGRESS §6): create a valid public token, URL-restrict it to the production and preview domains, put it in `.env.local` and Vercel (`NEXT_PUBLIC_MAPBOX_TOKEN`), redeploy, and set usage notifications (console.mapbox.com/account/settings/usage-thresholds). Until then the studio runs on the free Photon + USGS fallback.
- [ ] **Vercel Web Analytics** (FR-ANL-01): Vercel → Project → Analytics → Enable (free on Hobby). Tell the agent when it's on; it then adds `@vercel/analytics` (adding it before enabling causes a 404 console error). When it's added, /privacy must list Vercel's cookieless page-view analytics again (removed on Oct 16 because it isn't on yet).
- [ ] **Google Search Console** (P4-09, RC12): add the property for the production URL, submit `/sitemap.xml`, and later fill `content/seo-report.json → searchConsole` (`submittedAt`, `discoveredPages`, `indexedPages`, `checkedAt`).

## B. Phase 5 exit gate (on production, with the crew phone)

- [ ] Book a yard walk on **production** from a phone: the crew phone buzzes within **5 s**, the confirmation shows "Sent to the crew's phone", and `/live` shows the booking and the estimate count.
- [ ] Note: preview deployments also have `NTFY_TOPIC`, so preview bookings buzz the phone too.

## C. Devices and browsers

- [ ] **Share previews 4/4** (P6-03, C12): paste the production URL of `/`, `/rebates/phoenix` and `/studio` into iMessage, LinkedIn (post inspector: linkedin.com/post-inspector), Slack and X; each shows the desert card with the page title. If an old preview sticks, re-scrape in LinkedIn's inspector.
- [ ] **Rich Results Test** (P6-04, FR-SEO-03): run search.google.com/test/rich-results on `/how-it-works`, `/rebates/phoenix` and one guide; expect FAQ, Breadcrumb and Article detected with no errors.
- [ ] **Visualizer on a real iPhone and Android phone** (P3-09): camera capture, HEIC on iOS, a live render, the fallback.
- [ ] **Private-window test on two phones and a laptop** (P7-08, R2 rule): production URL opens without login, HTTPS, no console errors.
- [ ] **Keyboard walkthrough** of the main journey (home → studio → eligibility → book) with visible focus, and a **screen-reader spot check** (VoiceOver or NVDA) on home, studio results and the eligibility result (P7-04, C10).

## D. Content and copy (R4)

- [ ] **Copy review** (P4-08): home headings not in CONTENT.md ("What your city pays", "Low-water plants that belong here.", "Good questions, straight answers.", the city-cards lead) and the concept note on the promise guarantee. Approve or replace.
- [ ] **Fall-planting guide** (CONTENT §10.2): add a sourced paragraph on watering new plants / what to plant first, or keep as is.
- [ ] **plants.json list PDF**: ADWR now links `…/2025-01/2024_Phx5MPLWUPL_Final_v2.pdf`; choose whether to switch (update `listSourceUrl`).
- [ ] **Organizer answers** (HACKATHON §8): scoring scale, Crowd Favorite, pitch length/format, user tests at the venue, pre-weekend work. Log them in PROGRESS.

## E. Before the pitch (Sat/Sun)

- [ ] **User testing rounds 1 and 2** (P7-01, P7-06): 5–8 testers each using the numbered tester links in `docs/LINKS.md` (they alternate headline A/B); five-second test; ask permission before quoting anyone ("tester feedback"). Results flow to /insights and the Proof drawer automatically; write each five-second-test outcome into `test_sessions.notes` as `5s:pass` or `5s:fail` (plus any words you like); the /insights headline panel counts those tokens.
- [ ] **Decisions log** (P7-02, RC11): after each data-driven change, add an entry to `content/decisions.json` (date, observation, evidence, change, result). Real observations only.
- [ ] **Team devices use the team link** in `docs/LINKS.md` once per browser (and in any private window) so our own visits are excluded from /insights (FR-INS-13).
- [ ] **Share only tagged links** from `docs/LINKS.md` (RC12); print `docs/qr/qr-table.svg` for the table card and put `docs/qr/qr-pitch.svg` on the last pitch slide.
- [ ] **Demo video** 45–60 s and **before/after screenshots** (P7-09, RC8, RC9).
- [ ] **Set `LIVE_SINCE`** in Vercel to the pitch start (e.g. `2026-10-18T12:00:00-07:00`) and redeploy, if the board should count from then (P8 11:15).
- [ ] **Demo-mode rehearsal** (P7-07): on the pitch laptop and phone open `/?demo=1`, visit /studio, /visualize, /eligibility, /book and /live once, then turn Wi-Fi off and run the sample-yard rebate, a sample preview and eligibility. Booking and the live push need the network. `?demo=0` turns it off.
- [ ] **Rehearse the pitch** with the live demo and the fallback path (P7-11).
- [ ] **Pre-submission checklist** (HACKATHON §9) on Sunday by 11:15: private window on phone + laptop, disclosures, every flow end to end, Lighthouse saved (`pnpm quality` after adding reports), launch notes current, `pnpm timeline` committed before the 10:30 freeze.
- [ ] **Submission** (yours; agents don't do it): draft answers in `docs/SUBMISSION.md`: draft Saturday evening, submit by 11:30 AM Sunday (HACKATHON §6). The GitHub repo stays private, so leave the optional repository field empty.
