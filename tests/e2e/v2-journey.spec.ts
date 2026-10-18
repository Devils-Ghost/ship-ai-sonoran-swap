import { expect, test } from "@playwright/test";

test("V2 sample plan keeps estimate and style connected, with a clear reset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try a sample yard →", exact: true }).click();
  const results = page.getByRole("region", { name: "Your results" });
  await expect(results).toContainText("$2,400");
  await expect(page.getByLabel("Your desert yard plan")).toBeVisible();
  await expect(page.getByText("Demo mode · mock previews, no crew push")).toBeVisible();
  await page.getByLabel("Landscape style").selectOption("modern-desert");
  await expect(page.getByAltText("The same sample yard in Modern Desert style")).toBeVisible();
  await expect(results).toContainText("$2,400");
  await page.getByRole("radio", { name: "I know my square footage" }).click();
  await expect(page.getByLabel("Grass area (sq ft)")).toHaveValue("1200");
  await page.getByLabel("Grass area (sq ft)").fill("501");
  await page.getByRole("combobox", { name: "Your water bill comes from" }).selectOption("chandler");
  await expect(results).toContainText("$765");
  await expect(page.getByLabel("Landscape style")).toHaveValue("modern-desert");
  await expect(results).toContainText("not guaranteed");
  await page.getByRole("button", { name: "Reset plan" }).click();
  await expect(results).toContainText("Your rebate appears here.");
});

test("style links validate untrusted values and restore public state", async ({ page }) => {
  await page.goto("/studio?city=phoenix&sqft=1200&tier=essentials&style=modern-desert");
  await expect(page.getByLabel("Landscape style")).toHaveValue("modern-desert");
  await expect(page.getByRole("region", { name: "Your results" })).toContainText("$7,200 – $10,800");
  await page.goto("/studio?city=phoenix&sqft=1200&style=../../bad");
  await expect(page.getByLabel("Landscape style")).toHaveValue("sonoran-native");
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`V2 home and populated studio fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/studio?sample=1"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.locator('img[loading="lazy"]').evaluateAll((images) =>
        images.forEach((image) => {
          (image as HTMLImageElement).loading = "eager";
        }),
      );
      await page.evaluate(() =>
        Promise.all(Array.from(document.images).map((image) => image.decode().catch(() => {}))),
      );
      await page.screenshot({
        path: `shots/v2-${route === "/" ? "home" : "studio"}-${width}.png`,
        fullPage: true,
      });
    }
  });
}
