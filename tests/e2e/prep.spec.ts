import { expect, test } from "@playwright/test";

// SRS §6.3 (FR-PREP-01–03). The map snapshot path is covered in map-fallback.spec.ts.

test("without a measurement, the sheet asks you to measure first", async ({ page }) => {
  await page.goto("/studio/prep");
  await expect(page.getByText("Measure your lawn first")).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Measure my lawn" })).toHaveAttribute(
    "href",
    "/studio",
  );
});

test("a typed Mesa measurement prints the engine's rebate, documents, source and footer", async ({
  page,
}) => {
  await page.goto("/studio/prep?city=mesa&sqft=1520&tier=signature");
  await expect(page.getByText("$2,000", { exact: true })).toBeVisible();
  await expect(page.getByText("1,520 sq ft", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Documents Mesa asks for" })).toBeVisible();
  await expect(page.getByText(/No map image/)).toBeVisible();
  await expect(
    page.getByText("Prepared with Sonoran Swap (concept). Not an official city form."),
  ).toBeVisible();
  await expect(page.getByText(/Eligibility and payment are decided by the City of Mesa/)).toBeVisible();

  await page.evaluate(() => {
    (window as unknown as { printed: boolean }).printed = false;
    window.print = () => {
      (window as unknown as { printed: boolean }).printed = true;
    };
  });
  await page.getByRole("button", { name: "Print / Save as PDF" }).click();
  expect(await page.evaluate(() => (window as unknown as { printed: boolean }).printed)).toBe(true);
});
