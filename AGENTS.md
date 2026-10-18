# AGENTS.md: Rules for AI coding agents

> These rules apply to **every** AI coding agent working in this repository (Claude Code, Codex, Cursor or any other). `CLAUDE.md` imports this file. Humans on the team follow them too.

## 0. Read order (before your first change in a session)

1. `HACKATHON.md`: the contest rules, rubric and measurable targets. This is the top authority.
2. `docs/PHASES.md`: find the **current phase** and its task list. Work only on that phase unless told otherwise.
3. `docs/SRS.md`: the requirements. Every feature you build must trace to an SRS requirement ID (e.g., `FR-EST-04`).
4. `docs/ARCHITECTURE.md`: where code goes and how modules talk.
5. `docs/DESIGN_SYSTEM.md`: tokens, components and states.
6. `docs/CONTENT.md`: approved copy. Do not invent marketing copy if approved copy exists.
7. `content/*.json`: the single source of truth for business data, rebate rules, pricing, styles and plants.
8. `docs/PROGRESS.md`: what is already built, decisions taken and why, and known gotchas. Update it when you finish a task.

If documents conflict: `HACKATHON.md` > `docs/SRS.md` > `docs/ARCHITECTURE.md` > `docs/DESIGN_SYSTEM.md` > `docs/CONTENT.md` > this file's defaults. Flag the conflict in your summary.

## 1. Mission

Build the **best marketing website for a local business** we can ship by **Sunday, Oct 18, 11:30 AM Arizona time**. The business is **Sonoran Swap**, a concept Phoenix desert-landscaping company. We are judged on **Design, Craft and Receipts**, equally. The site, not a product dashboard, is the deliverable.

## 2. Absolute rules (never break these)

1. **Never invent facts.** No fake reviews, testimonials, ratings, customer counts, licenses, awards, team members, years in business, logos or statistics. If content needs a fact we don't have, use the approved placeholder pattern `TODO(VERIFY): <what is needed>` and report it.
2. **Rebate numbers come only from `content/rebate-programs.json`** through `lib/rebates/engine.ts`. Never hard-code a rebate amount, minimum, cap or rule in a component, prompt or copy.
3. **Prices come only from `content/pricing.json`** and are always labeled "Illustrative concept pricing" while `business.mode === "concept"`.
4. **No personal data.** Do not collect, store or log names, emails, phone numbers, street addresses or exact coordinates, except the optional feedback email with explicit consent (SRS `FR-FB`). Addresses are used in the browser for geocoding only and are never sent to our server. Uploaded photos are never stored.
5. **Secrets stay server-side.** Only variables prefixed `NEXT_PUBLIC_` may reach the browser, and only the restricted Mapbox public token and non-sensitive config may use that prefix.
6. **Concept disclosure** components must render whenever `business.mode === "concept"` (SRS `FR-DISC`). Never remove them to "clean up" a design.
7. **AI images are labeled** "AI concept rendering. Actual results vary." wherever shown, downloaded or shared.
8. **No lorem ipsum, no stock "trusted by" logo rows, no fake urgency timers, no dark patterns.**
9. **The site must work without login and in a private window.** Never add auth, password protection or preview protection to production.
10. **$0 infrastructure.** Never add a paid service, a dependency that requires a paid plan, or instructions to add a payment method. Use the free choices in `docs/ARCHITECTURE.md` §10 and keep every free-tier limit behind a fallback.
11. **Never break `main`.** `main` deploys to production. Work on a branch per task; merge only when checks pass.

## 3. How to work

### 3.1 Task loop

For every task:
1. Restate the task and the SRS IDs it satisfies, in two to four lines.
2. Plan the files you'll touch. Prefer editing existing modules over creating parallel ones.
3. Implement in small, reviewable steps.
4. Run `pnpm typecheck && pnpm lint && pnpm test` (and `pnpm e2e` when you touched a user journey). All must pass.
5. Check the UI at 375 px and 1440 px (Playwright screenshot or browser) for anything visual.
6. Update `content/timeline.json` only via `pnpm timeline` (see §6). Do not hand-edit dates.
7. Summarize: what changed, SRS IDs covered, tests added, screenshots, open `TODO(VERIFY)` items, anything you could not finish.

### 3.2 When uncertain

- If a requirement is ambiguous, **choose the simplest behavior that satisfies the SRS and the rubric**, note the assumption in your summary, and continue. Do not stall.
- If a decision is irreversible or touches rules in §2, **stop and ask**.
- If an external API behaves differently from the docs (model names, endpoints, limits), use the provider adapter pattern (ARCHITECTURE §6), make the provider configurable by env var, and report the difference.

### 3.3 Scope discipline

- Build only what the current phase lists. Ideas go into `docs/PHASES.md` → "Parking lot", not into code.
- Never add a dependency without stating why and its size; prefer the platform, React and existing deps.
- No new pages, routes or features outside the SRS without approval.

## 4. Code standards

- **Language:** TypeScript with `strict: true`. No `any` (use `unknown` + narrowing). No non-null assertions without a comment.
- **Framework:** Next.js App Router. Server Components by default; add `"use client"` only for interactivity (map, slider, forms, visualizer).
- **Styling:** Tailwind CSS with the tokens in `DESIGN_SYSTEM.md` exposed as CSS variables. No arbitrary hex values in components; use tokens. shadcn/ui components are allowed but **must be restyled** to our tokens.
- **Validation:** Zod schemas for every API input and every `content/*.json` file (validated at build time in `lib/content/schema.ts`). Invalid content fails the build.
- **Data:** Drizzle ORM. Schema in `db/schema.ts`. Migrations via `pnpm db:generate` and `pnpm db:migrate`. Never write raw SQL in route handlers.
- **Pure logic is pure:** rebate engine, area math, pricing, eligibility and slot generation live in `lib/` as pure functions with unit tests and no I/O.
- **Errors:** never show stack traces to users. Every API route returns `{ ok: true, data }` or `{ ok: false, error: { code, message } }` with a correct status code. Log server errors with a request ID, no personal data.
- **Accessibility:** semantic HTML first; labels on every input; visible focus; `aria-live` for async results; respect `prefers-reduced-motion`; 44 px targets; color is never the only signal.
- **Performance:** images via `next/image` with explicit sizes; fonts via `next/font`; lazy-load the map and visualizer bundles but reserve their space (no layout shift); no client JS on purely static pages beyond what's needed.
- **Naming:** files `kebab-case.ts(x)`; components `PascalCase`; hooks `useThing`; constants `SCREAMING_SNAKE_CASE`; analytics events `snake_case` from the list in SRS §11.
- **Comments:** explain *why*, not *what*. Reference SRS IDs in non-obvious logic: `// FR-REB-07: Chandler rounds up to 10 sq ft`.

## 5. Testing requirements

| Layer | Tool | Must cover |
|---|---|---|
| Unit | Vitest | Rebate engine (every program, every boundary in SRS §7), area conversion, pricing, eligibility, slots, content schemas |
| Component | Vitest + Testing Library | Estimator result states, eligibility flow, slider keyboard control |
| End-to-end | Playwright | Sample-yard path to a rebate; manual sq ft path; eligibility; visualizer with mocked provider; booking; 404; mobile viewport |
| Accessibility | @axe-core/playwright | Home, /studio, /visualize, /rebates/phoenix: 0 serious or critical |
| Visual | Playwright screenshots | Home and /studio at 375, 768, 1440 |

External providers (image model, Mapbox, push, database) must be mockable via env flags (`MOCK_IMAGE_PROVIDER=1`, etc.) so tests and the demo fallback never depend on the network.

## 6. Git, commits and receipts

Our commit history **is** a receipt shown to judges (the Proof drawer timeline). Treat it as public.

- Branches: `phase-N/short-task-name`.
- Commits: Conventional Commits, present tense, user-meaningful, e.g. `feat(estimator): show Chandler rebate rounded to 10 sq ft (FR-REB-07)`. No "wip", "fix stuff", or AI boilerplate.
- One logical change per commit. Squash noise before merging.
- After merging a meaningful slice, run `pnpm timeline` to regenerate `content/timeline.json` from `git log` (Vercel builds use shallow clones, so the JSON is committed, not generated at deploy).
- Never commit `.env*` files (except `.env.example`), API keys, photos from testers, or generated renders.

## 7. Definition of done (every task)

- [ ] Satisfies the listed SRS IDs and acceptance criteria.
- [ ] Typecheck, lint, unit and relevant e2e tests pass.
- [ ] Works at 375 px and 1440 px; keyboard accessible; no console errors.
- [ ] All states designed: loading, empty, error, success (SRS §12).
- [ ] Copy matches `docs/CONTENT.md` or is flagged for review.
- [ ] No rule in §2 violated; disclosures intact.
- [ ] Summary written with open `TODO(VERIFY)` items.

## 8. Things agents get wrong here (read twice)

- Hard-coding "$2 per square foot" in a component. **Use the engine.**
- Treating Scottsdale as open. Its program status is `"closed"`/relaunching; show status, not an amount.
- Calling the Mesa incentive per-square-foot. **It is tiered.**
- Forgetting Chandler rounds **up** to 10 sq ft increments and caps at $2,000.
- Showing the rebate as guaranteed. Always "estimated" plus the city disclaimer.
- Sending the street address to our API. Geocode in the browser; send only city and area.
- Storing uploaded photos or renders. Don't.
- Adding a chatbot. **This site deliberately has no chatbot**; the tools are the product (SRS §2.4).
- Using sponsor names or city logos. Don't.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
