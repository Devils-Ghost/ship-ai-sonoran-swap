import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { ROUTES } from "@/lib/routes";

// SRS §5.2: no breadcrumbs on these.
const NO_CRUMBS = new Set(["/", "/studio", "/visualize", "/live"]);

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

for (const route of ROUTES) {
  test(`${route.path} renders one H1, the disclosure and no console errors`, async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(route.path);
    expect(res?.status()).toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);
    // FR-DISC: the footer disclosure is on every page while business.mode === "concept".
    await expect(page.getByRole("contentinfo")).toContainText("Not affiliated with any city");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveCount(
      NO_CRUMBS.has(route.path) ? 0 : 1,
    );
    await expect(page).toHaveTitle(route.title);
    expect(errors).toEqual([]);
  });
}

test("unknown pages and unknown cities return the 404 page", async ({ page }) => {
  for (const path of ["/no-such-page", "/rebates/tempe", "/styles/tropical"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page dried up.");
  }
});

test("the concept badge is reachable on every viewport", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog").getByRole("link", { name: "Concept business" })).toBeVisible();
  } else {
    await expect(page.getByRole("banner").getByRole("link", { name: "Concept business" })).toBeVisible();
  }
});

test("the mobile menu opens, closes with Escape and returns focus", async ({ page, isMobile }) => {
  test.skip(!isMobile, "menu button is mobile-only");
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("link", { name: "How it works" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("the skip link is the first tab stop and jumps to main content", async ({ page }) => {
  await page.goto("/rebates");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

for (const path of ["/", "/rebates/phoenix", "/how-it-works"]) {
  test(`${path} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).analyze();
    const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}

test("sitemap lists only indexable routes", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? "").pathname);
  expect(locs.sort()).toEqual(
    ROUTES.filter((r) => r.index)
      .map((r) => r.path)
      .sort(),
  );
});
