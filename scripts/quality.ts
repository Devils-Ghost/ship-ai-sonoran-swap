// RC7 / FR-PROOF-02 Quality tab: reads every saved Lighthouse report in public/reports and writes the
// scores to content/quality.json, so no score is ever typed by hand. Run `pnpm quality` after saving reports.
// Reports are named `round-<n>-<form factor>-<page>.report.html`. Their capture time is reset to the epoch and
// hidden, so neither the files nor the site carry a date.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "reports");
const OUT = path.join(process.cwd(), "content", "quality.json");

type Lhr = {
  finalDisplayedUrl?: string;
  finalUrl?: string;
  configSettings: { formFactor: string };
  categories: Record<string, { score: number | null }>;
  audits: Record<string, { numericValue?: number }>;
};

const pct = (n: number | null | undefined) => (n == null ? null : Math.round(n * 100));

const reports = readdirSync(DIR)
  .filter((f) => f.endsWith(".report.html"))
  .sort()
  .map((file) => {
    const html = readFileSync(path.join(DIR, file), "utf8");
    const m = /window\.__LIGHTHOUSE_JSON__ = (\{[\s\S]*?\});<\/script>/.exec(html);
    if (!m?.[1]) throw new Error(`${file}: no Lighthouse JSON found`);
    const lhr = JSON.parse(m[1]) as Lhr;
    const round = /^round-(\d+)-/.exec(file)?.[1];
    if (!round) throw new Error(`${file}: name must start with round-<n>-`);
    const url = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl ?? "");
    return {
      file: `/reports/${file}`,
      round: Number(round),
      formFactor: lhr.configSettings.formFactor,
      host: url.host,
      path: url.pathname,
      scores: {
        performance: pct(lhr.categories.performance?.score),
        accessibility: pct(lhr.categories.accessibility?.score),
        bestPractices: pct(lhr.categories["best-practices"]?.score),
        seo: pct(lhr.categories.seo?.score),
      },
      lcpMs: Math.round(lhr.audits["largest-contentful-paint"]?.numericValue ?? 0),
      cls: Number((lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3)),
    };
  });

writeFileSync(OUT, `${JSON.stringify({ reports }, null, 2)}\n`);
console.log(`quality: ${reports.length} reports`);
