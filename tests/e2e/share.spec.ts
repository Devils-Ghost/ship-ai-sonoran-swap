import { expect, test } from "@playwright/test";

// Shareable rebate result: the link carries only city and lawn size; the share page is noindex.

test.describe("share a rebate result", () => {
  test.beforeEach(async ({ context, browserName }) => {
    if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("the hero estimator copies a link with only the city and lawn size", async ({ page }) => {
    await page.addInitScript(() => {
      // Force the copy fallback, as on browsers without the Web Share API.
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });
    await page.goto("/");
    await page.getByLabel("Lawn (sq ft)").fill("1240");
    await page.getByRole("button", { name: "Share this estimate" }).click();
    await expect(page.getByText("Link copied. It holds only the city and lawn size")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(copied);
    expect(url.pathname).toBe("/share");
    expect([...url.searchParams.keys()].sort()).toEqual(["city", "sqft"]);
    expect(url.searchParams.get("city")).toBe("phoenix");
    expect(url.searchParams.get("sqft")).toBe("1240");
  });

  test("uses the Web Share API when the browser has it", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __shared: ShareData[] };
      w.__shared = [];
      Object.defineProperty(navigator, "share", {
        value: async (data: ShareData) => void w.__shared.push(data),
        configurable: true,
      });
      Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Share this estimate" }).click();
    const shared = await page.evaluate(() => (window as unknown as { __shared: ShareData[] }).__shared);
    expect(shared).toHaveLength(1);
    expect(shared[0]?.title).toBe("This lawn could earn $2,400 from Phoenix");
    expect(shared[0]?.url).toMatch(/\/share\?city=phoenix&sqft=1200$/);
  });

  test("hides sharing when there is no amount to share", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Lawn (sq ft)").fill("200");
    await expect(page.getByRole("button", { name: "Share this estimate" })).toHaveCount(0);
  });

  test("the studio result can be shared", async ({ page }) => {
    await page.goto("/studio");
    await page.getByRole("radio", { name: /sample yard/i }).click();
    await expect(page.getByRole("button", { name: "Share this estimate" })).toBeVisible();
  });
});

test("the share page shows the engine's amount, its own share image, and stays out of search", async ({
  page,
  request,
}) => {
  await page.goto("/share?city=mesa&sqft=1520");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This lawn could earn $2,000 from Mesa.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(new URL(og ?? "", "http://x").searchParams.get("title")).toBe(
    "This lawn could earn $2,000 from Mesa",
  );
  await expect(page.locator("#main").getByRole("link", { name: "See my rebate" })).toHaveAttribute(
    "href",
    "/studio?city=mesa&sqft=1520",
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/share");
});

test("an incomplete share link explains itself instead of erroring", async ({ page }) => {
  await page.goto("/share?city=phoenix&sqft=12%20Main%20St");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This estimate link isn't complete.");
});
