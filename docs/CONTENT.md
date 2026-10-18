# CONTENT.md: Approved copy for Sonoran Swap

> Agents use this copy verbatim unless a layout forces a shorter variant (then keep meaning, flag the change). Numbers in curly braces come from the engine or content files; never type them by hand. Voice: calm, direct, local, plain. Short sentences. No "AI-powered," "revolutionary," "best in Phoenix," "trusted by," or fake urgency.

## 1. Global

| Element | Copy |
|---|---|
| Wordmark | Sonoran Swap |
| Tagline | The city pays. We do the swap. |
| One-liner | Sonoran Swap turns Phoenix lawns into desert yards, and the city helps pay for it. |
| Primary CTA | See my rebate |
| Secondary CTA | Preview my yard |
| Tertiary CTA | Book a free yard walk |
| Concept badge | Concept business |
| Footer disclosure | Sonoran Swap is a concept business built for the Ship AI AZ GTM Hackathon. Rebate information comes from official city pages; eligibility and payment are decided by each city. Not affiliated with any city. |
| Footer credit | Built at Ship AI AZ · Workuity Biltmore · Oct 17–18, 2026 |
| Rebate disclaimer | Estimate only. Eligibility and payment are decided by the City of {City}. Sonoran Swap is not affiliated with any city. |
| AI label | AI concept rendering. Actual results vary. |
| Pricing caption | Illustrative concept pricing. |
| Source note | Source: {Program name}, City of {City} · checked {Mon D, YYYY} |

## 2. Home

### Hero
- **Eyebrow:** Phoenix · Mesa · Chandler
- **H1 (A):** Phoenix will pay you to lose your lawn.
- **H1 (B):** Swap your lawn for the Sonoran. The city helps pay.
- **Subhead:** Draw your lawn on a satellite map, see your city rebate, and preview your yard as a desert garden, all in about a minute. We handle the design, the paperwork and the swap.
- **Trust line:** Rebate rules from official city pages · last checked Oct 15, 2026
- **Quick estimate label:** How big is your lawn?
- **Quick estimate result:** Estimated rebate: {amount} · {basis}
- **Quick estimate link:** Measure my actual lawn →

### How the swap works (six steps)
1. **Measure.** Outline your lawn on the map. We confirm it on a free yard walk.
2. **Design.** Pick Sonoran Native, Modern Desert or Pollinator Garden.
3. **Apply.** We prepare your city application packet. You submit it.
4. **Approval.** We wait for the city's written go-ahead. Nothing comes out before that.
5. **Swap.** Grass out. Drip in. Plants and granite in.
6. **Rebate.** Final photos and paperwork. The city inspects and pays you.

### Rebates by city (cards)
- **Phoenix:** $2 per sq ft · 250 sq ft minimum · approval first
- **Mesa:** $1,000 – $2,000 by lawn size, + up to $100 for new trees · 500 sq ft minimum · approval first
- **Chandler:** $1.50 per sq ft, up to $2,000 · 500 sq ft minimum · approval first
- **Scottsdale:** Between seasons. The program closed Oct 31, 2025, and is set to return.
(Card values must be rendered from `rebate-programs.json`; this text shows the intended format.)

### Styles teaser
- Eyebrow: Three ways to go desert
- H2: See your yard before you change it.
- Lead: Upload a photo of your lawn and preview it in three styles.

### Approval-first band
- **H2:** Approval first. Always.
- **Body:** Most city programs only pay for grass removed *after* they approve your project. Pull it out early and you can lose the whole rebate. We never remove a blade of grass before your approval arrives in writing.
- **Link:** Check my eligibility →

### Why now
- **H2:** Start in October. Plant in November.
- **Body:** Fall is planting season in Phoenix, and plants that go in before the short days of winter have time to settle in. City approval comes first and can take up to three weeks, so the best time to start is now.

### Water
- **H2:** Less lawn. Less water.
- **Body:** A 1,000 sq ft lawn uses roughly 23,000 gallons of water a year. *(Estimate based on a City of Phoenix figure of about one million gallons per acre of grass per year.)*

### Pricing preview
- H2: Clear ranges, before anyone visits.
- Lead: Every project is different. Here's what most yards cost per square foot, before your rebate.

### FAQ (home; also used on /how-it-works with JSON-LD)
1. **How much will my city pay?** Phoenix pays $2 per square foot (250 sq ft minimum). Mesa pays $1,000 to $2,000 depending on lawn size, plus up to $100 for new trees. Chandler pays $1.50 per square foot, up to $2,000. Use the studio to see your number. *(Render values from data.)*
2. **Do I have to remove grass before I apply?** No, and you shouldn't. Most programs require written approval before any grass is removed.
3. **Does artificial turf count?** Not in Mesa or Chandler: their rules exclude it. Phoenix asks you to describe your replacement landscape and recommends desert landscaping.
4. **How long does it take?** Phoenix's review can take up to three weeks. After approval, Phoenix and Mesa give you six months to finish; Chandler gives 90 days. The swap itself usually takes a few days.
5. **Is the AI preview what my yard will look like?** It's a concept to help you choose a style. Your real design is drawn after a yard walk.
6. **Is Sonoran Swap a real company?** Not yet. It's a concept business built for a Phoenix hackathon to show how a local landscaper's website could work. The rebate information is real and linked to official city pages.

### Final CTA
- **H2:** Your lawn is costing you water. Your city wants it gone.
- **Button:** See my rebate

## 3. Studio
- H1: Measure your lawn. See your rebate.
- Entry options: **Measure on the map** · **I know my square footage** · **Try a sample yard**
- Address placeholder: Start typing your address
- Address privacy note: Your address stays in your browser. We only keep your city and lawn size.
- Draw hint: Tap around the edge of your grass. Tap the first point to finish. Add more shapes for other patches.
- Utility select label: Your water bill comes from
- Results empty: Your rebate appears here.
- Tier label: Project style
- Labels: Estimated rebate · Project estimate · After your rebate · Water saved (estimate) · Timeline
- Too large warning: That's larger than most residential lawns. Double-check your outline.
- Self-intersect: Your shape crosses itself. Drag a corner to fix it.
- Map unavailable: The map isn't loading right now. Enter your square footage or try the sample yard.
- Not in data: We don't have {City}'s program in our data yet. Check your water utility's conservation office. Your project and water estimates still apply.

## 4. Eligibility
- H1: Will your yard qualify?
- Intro: Seven quick questions. We'll tell you what looks good, what to check, and the one mistake to avoid.
- Results:
  - **Looks eligible:** Looks good so far. Next step: apply for approval before anything is removed.
  - **Not eligible right now:** Here's what's in the way, and what would change it.
  - **Check with the city:** A couple of answers need the city to confirm.
- Removed-grass answer: Most programs only pay for grass removed after approval. Don't remove more. Contact the city before you continue.

## 5. Visualizer
- H1: See your lawn as a desert yard.
- Upload: Upload a photo · Take a photo · Use a sample yard
- Upload note: Your photo is sent to our image provider to create the preview and isn't stored by us.
- Tips: Stand at the street or porch. Get the whole lawn in frame. Daylight works best.
- Progress steps: Uploading… · Designing your yard… · Adding plants…
- Slow: Taking longer than usual. Keep waiting, or see an example instead.
- Fallback label: Example rendering (live preview unavailable)
- Refused: We couldn't process that photo. Try a photo of a yard.

## 6. Styles
| Style | Tagline | Description |
|---|---|---|
| Sonoran Native | The desert, as it grows here. | Palo verde shade, golden barrel and brittlebush in warm decomposed granite. Native plants, natural drifts, almost no upkeep once established. |
| Modern Desert | Clean lines, bold shapes. | Sculptural agaves and red yucca, large boulders, gray granite and steel edging. Architectural and calm. |
| Pollinator Garden | Color for you, food for bees. | Penstemon, globe mallow, desert marigold and salvias that bloom across the seasons and feed bees, butterflies and hummingbirds. |

## 7. Booking
- H1: Book a free yard walk.
- Concept note (above button): This is a demonstration booking. No one will visit.
- Button (concept): Book a demo yard walk
- Confirmation H1: You're booked for {Day, Mon D}, {window}.
- Confirmation note: This is a demonstration booking. No one will visit. This shows how booking would work.
- Notify card: Sent to the crew's phone · {time} | Not delivered: we emailed the crew instead | Not delivered
- What happens next: the six steps with step 1 highlighted.

## 8. Error and empty states
- Generic error: Something went wrong on our side. Try again in a moment.
- Rate limited: You're moving fast. Try again in a minute.
- Offline: You're offline. Your estimate still works; previews and booking need a connection.
- 404 H1: This page dried up. Body: The page you're looking for isn't here. Let's get you back on track. Buttons: Home · See my rebate

## 9. Insights page
- H1: Growth insights
- Lead: How this site is performing, from its own anonymized data. This is the dashboard a landscaper would use to improve their marketing, shown in the open.
- Live label: Live data from this site since {date}
- Panel titles: The funnel · Click-through · Headline test · Where visitors come from · Who's measuring · Feature health · SEO readiness · What we changed because of data · How we'd measure the business
- Small-number label: n = {x}, too few to read
- A/B undecided: Too little data to call a winner yet.
- SEO note: Search rankings and search click-through take weeks to appear for a new site, so we show what we controlled this weekend: complete metadata, share previews, structured data and a submitted sitemap.
- KPI explainer: **North star:** booked yard walks. **Leading indicators:** estimate completion, rebate-to-booking, preview-to-booking. **Efficiency:** cost per booked walk by source, once there's ad spend. **Quality:** share of bookings that pass the eligibility check.
- Decisions log empty state: Our first test round is Saturday at 12:30 PM. Changes we make because of data will appear here.

## 10. Guides (outlines)

### 10.1 How to get Phoenix's grass removal rebate, step by step
1. Check you qualify (owner, Phoenix Water Services customer, grass alive and ≥ 75% dense).
2. Measure your grass and get an aerial image with the square footage (our studio does both).
3. Take two photos of the grass.
4. Plan the replacement (desert landscaping recommended; no water features or pools; no bare soil).
5. Gather documents: project description, W-9, Affidavit of Lawful Presence with ID (rental form if applicable).
6. Apply online through myPHX311 only.
7. Wait for the Notice to Proceed (up to 3 weeks). Don't remove anything yet.
8. Do the swap within 6 months.
9. Submit two after photos and the NTP copy.
10. Receive a check, typically within 1–2 billing cycles.
Sources: City of Phoenix Residential Grass Incentives page (link).

### 10.2 Fall planting in Phoenix: start your desert yard now
Why fall works (cooler nights, establishment before winter's short days; KJZZ master gardener interview); what to plant first (trees and shrubs); watering new plants on drip; the approval timeline; a planting calendar from October approval to November planting.

### 10.3 Artificial turf and rebates: what Mesa and Chandler say
Mesa excludes artificial turf or rock alone; Chandler prohibits artificial turf in the rebate area; Phoenix recommends desert landscaping and requires a described replacement. Why living plants and canopy matter (shade, heat). What to choose instead.

## 11. Pitch scripts

### 60 seconds
| Time | Beat | Words |
|---|---|---|
| 0–8 s | Hook | "The City of Phoenix will pay you two dollars a square foot to get rid of your lawn. Most people never claim it." |
| 8–18 s | Customer today | "Homeowners don't know their number, every city's rules are different, and one mistake, pulling grass before approval, loses the whole check." |
| 18–40 s | Live demo | Type an address, outline a lawn: "1,240 square feet. $2,480 back." Upload the photo we took this morning of the lawn outside: slide to the desert version. Book: the crew phone buzzes. |
| 40–52 s | Receipts | "{N} live pages, {X} working tools, Lighthouse {score}. {T} people here tried it; median time to their rebate: {S} seconds." |
| 52–60 s | Close | "Sonoran Swap: the city pays, we do the swap. Scan the code and find your rebate. This room has found {$} so far." (Point to /live.) |

### 3 minutes adds
- Mesa and Chandler math side by side (tiers vs per-foot with cap).
- The eligibility check catching the "already removed grass" mistake.
- The printable prep sheet with the aerial image the city asks for.
- The Proof drawer: timeline, scores, testing results, honest limits.
- **/insights:** "Here's our funnel from today. Testers stalled at the map, so we made the sample yard easier; completion went from X% to Y%. That's the loop a real landscaper would run every week."
- What we'd do next with a real landscaper.
