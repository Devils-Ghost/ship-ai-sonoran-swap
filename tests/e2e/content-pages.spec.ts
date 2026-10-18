import { expect, test } from "@playwright/test";

test("plants filter combines chips and shows an empty state", async ({ page }) => {
  await page.goto("/plants");
  await expect(page.getByText("16 of 16 plants")).toBeVisible();
  await page.getByRole("button", { name: "Trees" }).click();
  await expect(page.getByText("3 of 16 plants")).toBeVisible();
  await expect(page.getByRole("button", { name: "Trees" })).toHaveAttribute("aria-pressed", "true");
  // Trees that need part shade: none in the data, so the empty state shows.
  await page.getByRole("button", { name: "Part shade" }).click();
  await expect(page.getByText("No plants match. Clear filters to see them all.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page.getByText("16 of 16 plants")).toBeVisible();
});

test("pricing shows the engine's net-cost example and the concept caption (SRS §6.11)", async ({ page }) => {
  await page.goto("/pricing");
  const net = page.getByRole("region", { name: "How net cost works" });
  await expect(net).toContainText("$12,000 – $18,000");
  await expect(net).toContainText("$2,400");
  await expect(net).toContainText("$9,600 – $15,600");
  await expect(page.getByText(/Illustrative concept pricing\./)).toHaveCount(1);
  // QUALITY §4: no invented social proof on a concept business.
  await expect(page.getByText("Most chosen")).toHaveCount(0);
});

test("style pages pair a labeled before/after with plants from the data", async ({ page }) => {
  await page.goto("/styles/pollinator-garden");
  await expect(page.getByRole("slider", { name: "Compare before and after" })).toBeVisible();
  await expect(page.getByText("AI-generated sample yard. Not a real home.")).toBeVisible();
  await expect(page.getByText("Penstemon parryi")).toBeVisible();
  await expect(page.getByRole("link", { name: "Try this style on my yard" })).toHaveAttribute(
    "href",
    "/visualize?style=pollinator-garden",
  );
});

test("how it works ships FAQ structured data and the never list", async ({ page }) => {
  await page.goto("/how-it-works");
  await expect(page.getByText("Put artificial turf in a rebate area.")).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.map((t) => JSON.parse(t)).some((d) => d["@type"] === "FAQPage")).toBe(true);
});

test("guides render MDX with data-driven facts, sources and related links", async ({ page }) => {
  await page.goto("/guides/phoenix-grass-rebate-step-by-step");
  await expect(page.getByText(/pays \$2 per square foot of grass/)).toBeVisible();
  await expect(page.getByText("Review can take up to 3 weeks.", { exact: false })).toBeVisible();
  await expect(page.getByRole("region", { name: "Sources" })).toContainText("City of Phoenix");

  await page.goto("/guides/artificial-turf-and-rebates");
  await expect(
    page.getByText("Artificial turf or rock alone does not count.", { exact: false }),
  ).toBeVisible();
});

test("privacy explains that addresses and photos never reach our server", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByText(/never sent to our server/)).toBeVisible();
  await expect(page.getByText(/We don't store it\./)).toBeVisible();
});
