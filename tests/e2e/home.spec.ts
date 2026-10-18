import { expect, test } from "@playwright/test";

test("headline A by default, B at /?v=b with the URL kept (SRS §4.8)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Phoenix will pay you to lose your lawn.");
  await page.goto("/?v=b&src=test");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Swap your lawn for the Sonoran. The city helps pay.",
  );
  // The variant stays in the URL; the source tag is read once and stripped (SRS §11.9).
  await expect(page).toHaveURL(/\/\?v=b$/);
});

test("hero slider is keyboard-operable and every image is labeled", async ({ page }) => {
  await page.goto("/");
  const slider = page.getByRole("slider", { name: "Compare before and after" });
  await expect(slider).toHaveAttribute("aria-valuenow", "50"); // after the intro glide
  await slider.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuenow", "45");
  await expect(page.getByText("AI-generated sample yard. Not a real home.")).toBeVisible();
  // AGENTS §2.7: the AI label on the hero and on each style teaser image.
  await expect(page.getByText("AI concept rendering. Actual results vary.")).toHaveCount(4);
});

test("the lawn-size slider works from the keyboard and fills to its thumb (FR-HOME-02)", async ({ page }) => {
  await page.goto("/");
  const slider = page.getByRole("slider", { name: "Lawn size in square feet" });
  await slider.focus();
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("5000");
  await expect(page.getByText("$2.00 × 5,000 sq ft")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveValue("4990");
  await expect(page.getByLabel("Lawn (sq ft)")).toHaveValue("4990");
});

test("city cards come from the program data and link to each city", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByRole("region", { name: "What your city pays" });
  await expect(cards).toContainText("$2 per sq ft");
  await expect(cards).toContainText("$1,000 – $2,000 by lawn size");
  await expect(cards).toContainText("$1.50 per sq ft, up to $2,000");
  await expect(cards).toContainText("Between seasons");
  await cards.getByRole("link", { name: /Mesa/ }).click();
  await expect(page).toHaveURL(/\/rebates\/mesa$/);
});

test("FAQ answers render from data and ship FAQPage structured data", async ({ page }) => {
  await page.goto("/");
  await page.getByText("How much will my city pay?").click();
  await expect(page.getByText(/Phoenix pays \$2 per square foot \(250 sq ft minimum\)\./)).toBeVisible();

  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = ld.map((t) => JSON.parse(t)).find((d) => d["@type"] === "FAQPage");
  expect(faq?.mainEntity).toHaveLength(6);
});

test("only the approved disclosures and labels carry concept wording", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Illustrative concept pricing.")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("concept business");
});
