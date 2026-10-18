import { expect, test } from "@playwright/test";

// FR-RBH / FR-RBC: every figure comes from rebate-programs.json through the engine.

test("hub compares the four programs with sources and dates", async ({ page }) => {
  await page.goto("/rebates");
  for (const text of [
    "$2 per sq ft",
    "$1,000 – $2,000 by lawn size",
    "$1.50 per sq ft, up to $2,000",
    "Between seasons",
  ]) {
    await expect(page.getByText(text).filter({ visible: true }).first()).toBeVisible();
  }
  await expect(page.getByText("Last season up to $5,000").filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /City of Phoenix/ }).first()).toHaveAttribute(
    "href",
    /phoenix\.gov/,
  );
  await expect(
    page.getByText("Not in our data yet. Check your water utility's conservation office."),
  ).toBeVisible();
});

for (const [city, amount, basis] of [
  ["phoenix", "$2,400", "$2.00 × 1,200 sq ft"],
  ["mesa", "$1,500", "1,000–1,499 sq ft tier: $1,500"],
  ["chandler", "$1,800", "$1.50 × 1,200 sq ft"],
] as const) {
  test(`${city}: worked example, warning, source and links to studio and eligibility`, async ({ page }) => {
    await page.goto(`/rebates/${city}`);
    const money = page.getByRole("region", { name: "How the money is calculated" });
    await expect(money).toContainText(amount);
    await expect(money).toContainText(basis);
    await expect(page.getByRole("region", { name: "What you must not do" })).toContainText(
      "Don't remove any grass",
    );
    await expect(page.getByRole("region", { name: "Source" })).toContainText(
      new RegExp(`City of ${city}`, "i"),
    );
    await expect(page.getByRole("link", { name: "See my rebate" }).first()).toHaveAttribute(
      "href",
      "/studio",
    );
    await expect(page.getByRole("link", { name: "Check my eligibility" })).toHaveAttribute(
      "href",
      `/eligibility?city=${city}`,
    );
  });
}

test("chandler explains the 10 sq ft round-up with an engine example", async ({ page }) => {
  await page.goto("/rebates/chandler");
  await expect(page.getByText(/a 501 sq ft lawn pays \$765/)).toBeVisible();
});

test("scottsdale shows status only: no calculator, no amount", async ({ page }) => {
  await page.goto("/rebates/scottsdale");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Scottsdale's grass removal rebate is between seasons",
  );
  await expect(page.getByRole("region", { name: "How the money is calculated" })).toHaveCount(0);
  await expect(page.getByRole("slider")).toHaveCount(0);
});

test("city pages ship FAQPage structured data", async ({ page }) => {
  await page.goto("/rebates/phoenix");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.map((t) => JSON.parse(t)).some((d) => d["@type"] === "FAQPage")).toBe(true);
});
