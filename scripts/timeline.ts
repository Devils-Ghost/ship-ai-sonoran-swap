// FR-PROOF-02: the Proof drawer's build timeline, made at build time from the commit history.
// Reads the public GitHub commits API for the deployed repository (falls back to `git log`) and
// writes content/timeline.json, which is never committed. Never fails the build: on any error it
// writes an empty timeline and the tab hides itself. SHOW_BUILD_TIMELINE=0 turns it off.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

type Entry = {
  date: string;
  hash: string;
  title: string;
  description: string;
  type: string;
  scope: string | null;
};

const OUT = path.join(process.cwd(), "content", "timeline.json");
// User-meaningful commits only: features, fixes and performance.
const KEEP = /^(feat|fix|perf)(\(([^)]*)\))?!?:\s*/;
const MAX_DESCRIPTION = 220;

function write(entries: Entry[], source: string) {
  const out = { generatedAt: new Date().toISOString(), source, entries };
  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`timeline: ${entries.length} entries from ${source}`);
}

/** First one or two body lines, without trailers such as Co-Authored-By. */
function describe(body: string): string {
  const text = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^[\w-]+:\s/.test(l))
    .slice(0, 2)
    .join(" ");
  return text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…` : text;
}

function toEntry(hash: string, date: string, message: string): Entry | null {
  const [subject = "", ...body] = message.split("\n");
  const m = KEEP.exec(subject.trim());
  if (!m) return null;
  const title = subject
    .trim()
    .slice(m[0].length)
    .replace(/\s*\((?:N?FR|C|D|RC|SRS|AGENTS)[^)]*\)\s*$/, "")
    .trim();
  return {
    date,
    hash: hash.slice(0, 7),
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: describe(body.join("\n")),
    type: m[1] ?? "feat",
    scope: m[3] ?? null,
  };
}

function repoSlug(): string | null {
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const slug = process.env.VERCEL_GIT_REPO_SLUG;
  if (owner && slug) return `${owner}/${slug}`;
  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim();
    return /github\.com[:/]([^/]+\/[^/.]+?)(?:\.git)?$/.exec(url)?.[1] ?? null;
  } catch {
    return null;
  }
}

async function fromGitHub(slug: string, branch: string): Promise<Entry[]> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "sonoran-swap-timeline",
  };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const entries: Entry[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://api.github.com/repos/${slug}/commits?sha=${encodeURIComponent(branch)}&per_page=100&page=${page}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const commits = (await res.json()) as {
      sha: string;
      commit: { message: string; author: { date: string } | null };
    }[];
    for (const c of commits) {
      const e = toEntry(c.sha, c.commit.author?.date ?? "", c.commit.message);
      if (e) entries.push(e);
    }
    if (commits.length < 100) break;
  }
  return entries;
}

function fromGitLog(): Entry[] {
  const out = execFileSync("git", ["log", "--no-merges", "--pretty=format:%H%x1f%aI%x1f%B%x1e"], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return out
    .split("\u001e")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [hash = "", date = "", message = ""] = chunk.split("\u001f");
      return toEntry(hash, date, message);
    })
    .filter((e): e is Entry => e !== null);
}

async function main() {
  if (process.env.SHOW_BUILD_TIMELINE === "0") return write([], "disabled");
  const slug = repoSlug();
  if (slug) {
    try {
      return write(await fromGitHub(slug, process.env.VERCEL_GIT_COMMIT_REF || "main"), "github");
    } catch (err) {
      console.warn(`timeline: GitHub API unavailable (${(err as Error).message}); using git log`);
    }
  }
  try {
    write(fromGitLog(), "git");
  } catch {
    write([], "none");
  }
}

void main();
