import { content } from "@/lib/content/load";
import { publicEnv } from "@/lib/env";
import { ROUTES } from "@/lib/routes";

// FR-SEO-06 (optional): a plain-text summary of the business, its pages and data sources for AI crawlers.
// Built from the route registry and content files at build time, so it can't drift from the site.
export function GET() {
  const { business, rebates } = content;
  const url = (p: string) => new URL(p, publicEnv.siteUrl).toString();
  const lines = [
    `# ${business.name}`,
    "",
    `> ${business.oneLiner}`,
    "",
    business.mode === "concept" ? `Note: ${business.disclosures.footer}` : "",
    "",
    "## Pages",
    ...ROUTES.filter((r) => r.index).map((r) => `- [${r.title}](${url(r.path)}): ${r.description}`),
    "",
    "## Data sources",
    ...rebates.programs.map((p) => `- ${p.name}, City of ${p.city}: ${p.sourceUrl}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
