// FR-INS-08: route metadata coverage → content/seo-report.json, run before `next build` so /insights
// shows what this build actually ships. `searchConsole` is hand-maintained and always preserved.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "content", "seo-report.json");

async function main() {
  const { ROUTES } = await import("../lib/routes");
  const { pageMetadata } = await import("../lib/seo/metadata");
  const { JSON_LD_TYPES } = await import("../lib/seo/json-ld");

  const indexable = ROUTES.filter((r) => r.index);
  const titles = new Map<string, number>();
  for (const r of indexable) titles.set(r.title, (titles.get(r.title) ?? 0) + 1);
  const withOg = indexable.filter((r) => {
    const images = pageMetadata(r).openGraph?.images;
    return Array.isArray(images) ? images.length > 0 : Boolean(images);
  }).length;

  const previous = JSON.parse(readFileSync(OUT, "utf8")) as Record<string, unknown>;
  const report = {
    routes: indexable.length,
    withTitle: indexable.filter((r) => r.title.trim() && titles.get(r.title) === 1).length,
    withDescription: indexable.filter((r) => r.description.trim().length >= 50).length,
    withOg,
    jsonLdTypes: [...JSON_LD_TYPES].sort(),
    sitemapUrls: indexable.length, // app/sitemap.ts lists exactly the indexable routes
  };
  const unchanged = Object.entries(report).every(
    ([k, v]) => JSON.stringify(previous[k]) === JSON.stringify(v),
  );
  const out = {
    note: previous.note,
    generatedAt: unchanged && previous.generatedAt ? previous.generatedAt : new Date().toISOString(),
    ...report,
    searchConsole: previous.searchConsole,
  };
  writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
  console.log(
    `seo-report: ${report.routes} indexable routes, ${report.withTitle} unique titles, ${report.withOg} with OG images`,
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
