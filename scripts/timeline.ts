// P6-01 / FR-PROOF-02 / AGENTS §6: content/timeline.json from `git log`. Run with `pnpm timeline` after
// merging a slice; the JSON is committed because Vercel builds use shallow clones.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "content", "timeline.json");
const SEP = "\u001f";
// ARCH §5: user-meaningful commits only (features, fixes, performance, content).
const KEEP = /^(feat|fix|perf|docs\(content\))(\([^)]*\))?!?:\s*/;
const SINCE = "2026-10-15T00:00:00-07:00";

type Entry = { date: string; hash: string; title: string; type: string; scope: string | null };

// A new repository has no log yet; publish an empty timeline until its first commit.
const hasHead = spawnSync("git", ["rev-parse", "--verify", "HEAD"], { stdio: "ignore" }).status === 0;
const raw = hasHead
  ? execFileSync("git", ["log", "--no-merges", `--since=${SINCE}`, `--pretty=format:%aI${SEP}%h${SEP}%s`], {
      encoding: "utf8",
    })
  : "";

const entries: Entry[] = raw
  .split("\n")
  .filter(Boolean)
  .flatMap((line) => {
    const [date = "", hash = "", subject = ""] = line.split(SEP);
    const m = KEEP.exec(subject);
    if (!m) return [];
    const type = m[1] === "docs(content)" ? "content" : (m[1] ?? "feat");
    const scope = m[2] ? m[2].slice(1, -1) : null;
    const title = subject.slice(m[0].length).trim();
    return [{ date, hash, title: title.charAt(0).toUpperCase() + title.slice(1), type, scope }];
  });

// Keep generatedAt stable when nothing changed, so the file only diffs when the history does.
let previous: { generatedAt?: string; entries?: unknown } = {};
try {
  previous = JSON.parse(readFileSync(OUT, "utf8")) as typeof previous;
} catch {
  // first run
}
const same = JSON.stringify(previous.entries) === JSON.stringify(entries);
const out = {
  generatedAt: same && previous.generatedAt ? previous.generatedAt : new Date().toISOString(),
  entries,
};
writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
console.log(`timeline: ${entries.length} entries${same ? " (unchanged)" : ""}`);
