import { expect, test, type APIRequestContext } from "@playwright/test";

// FR-SEO-01/03/04/06.
/** JSON-LD blocks from the server HTML (structured data must be there without JavaScript). */
async function jsonLd(request: APIRequestContext, path: string): Promise<Record<string, unknown>[]> {
  const html = await (await request.get(path)).text();
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1] ?? "{}") as Record<string, unknown>,
  );
}
const types = (blocks: Record<string, unknown>[]) => blocks.map((b) => b["@type"]);

test("every page shares an OG image that renders as a PNG", async ({ page, request }) => {
  await page.goto("/rebates/phoenix");
  const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(og).toMatch(/\/api\/og\?title=/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const res = await request.get(
    new URL(og ?? "", "http://x").pathname + new URL(og ?? "", "http://x").search,
  );
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
});

test("structured data: WebSite everywhere, breadcrumbs, FAQ on rebate pages, Article on guides", async ({
  request,
}) => {
  expect(types(await jsonLd(request, "/"))).toContain("WebSite");

  const mesa = await jsonLd(request, "/rebates/mesa");
  expect(types(mesa)).toEqual(expect.arrayContaining(["WebSite", "WebPage", "FAQPage"]));
  const webPage = mesa.find((d) => d["@type"] === "WebPage") as {
    breadcrumb: { itemListElement: { name: string }[] };
  };
  expect(webPage.breadcrumb.itemListElement[0]?.name).toBe("Home");

  const guide = types(await jsonLd(request, "/guides/fall-planting-phoenix"));
  expect(guide).toContain("Article");
  expect(guide).not.toContain("LocalBusiness");
});

test("llms.txt lists the pages and the official sources", async ({ request }) => {
  const text = await (await request.get("/llms.txt")).text();
  expect(text).toMatch(/^# Sonoran Swap/);
  expect(text).toContain("/rebates/phoenix");
  expect(text).toContain("phoenix.gov");
});
