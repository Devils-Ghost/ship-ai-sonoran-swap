# CLAUDE.md

@AGENTS.md

> If the import above does not load in your environment, open and follow `AGENTS.md` before doing anything else. It contains the binding rules for this repository.

## Claude Code specifics

- **Start every session** by reading `HACKATHON.md`, then `docs/PROGRESS.md` (build status, decisions, gotchas, next steps), then the current phase in `docs/PHASES.md`. State which phase and task IDs you are working on.
- **End every task** by updating `docs/PROGRESS.md` (status, new decisions with reasons, open items) in the same PR.
- **Plan before editing** for any task touching more than two files: list the files, the SRS IDs, and the tests you will add. Then implement.
- **Verification commands** (run before saying a task is done):
  - `pnpm typecheck && pnpm lint && pnpm test`
  - `pnpm e2e` if you changed a page, route or user journey
  - `pnpm build` before any merge to `main`
- **Visual checks:** use Playwright to take screenshots at 375 and 1440 px (`pnpm shots`) and look at them before reporting UI work as done.
- **Keep context lean:** read only the SRS sections relevant to the current task (each section is numbered; requirement IDs are greppable, e.g. `rg "FR-REB-" docs/SRS.md`).
- **Do not** run destructive commands (`rm -rf`, `git push --force`, `db:drop`, deleting migrations) without explicit human approval.
- **Do not** change `content/rebate-programs.json` values unless a human gives you a newer official source; then update `lastVerified` and `sourceUrl` together.
- When you finish a phase task, write the summary format from `AGENTS.md` §3.1 step 7.

## Useful commands

```bash
pnpm dev            # local dev server
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint + prettier check
pnpm test           # vitest
pnpm e2e            # playwright (uses MOCK_* providers)
pnpm shots          # playwright screenshots at 375/768/1440 into ./shots
pnpm db:generate    # drizzle-kit generate
pnpm db:migrate     # apply migrations
pnpm timeline       # regenerate content/timeline.json from git log
pnpm build          # production build (also validates content/*.json)
```
