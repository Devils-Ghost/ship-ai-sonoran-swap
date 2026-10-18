// C5 / C6: screenshots of every sitemap route (plus the noindex tool pages) at the breakpoints in
// QUALITY §3.2, into ./shots (gitignored). Also reports horizontal scroll and console errors per page.
// Usage: pnpm shots [baseURL] [widths]   e.g. pnpm shots http://localhost:3200 375,1440
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const widths = (process.argv[3] ?? "320,375,768,1024,1440").split(",").map(Number);
const OUT = path.join(process.cwd(), "shots");
const EXTRA = ["/live", "/studio/prep?city=phoenix&sqft=1240&tier=signature", "/no-such-page"];

async function main() {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  const paths = [
    ...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? "/").pathname),
    ...EXTRA,
  ];
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const problems: string[] = [];

  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: width < 768 ? 812 : 900 } });
    for (const p of paths) {
      const errors: string[] = [];
      const onConsole = (m: { type(): string; text(): string }) =>
        m.type() === "error" && errors.push(m.text());
      page.on("console", onConsole);
      await page.goto(base + p, { waitUntil: "load" });
      await page.waitForTimeout(600);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      const name = (p === "/" ? "home" : p.slice(1).replace(/[/?&=]+/g, "_")).slice(0, 60);
      await page.screenshot({ path: path.join(OUT, `${name}-${width}.png`), fullPage: true });
      if (overflow > 0) problems.push(`${width}px ${p}: horizontal scroll by ${overflow}px`);
      // The 404 page logs its own 404 request; that's expected.
      for (const e of errors)
        if (!(p === "/no-such-page" && e.includes("404")))
          problems.push(`${width}px ${p}: ${e.slice(0, 160)}`);
      page.off("console", onConsole);
    }
    await page.close();
  }
  await browser.close();
  console.log(`shots: ${paths.length} pages × ${widths.length} widths → ./shots`);
  console.log(problems.length ? problems.join("\n") : "no horizontal scroll, no console errors");
  if (problems.length) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
