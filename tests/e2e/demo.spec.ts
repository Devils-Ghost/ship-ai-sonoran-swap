import { expect, test } from "@playwright/test";

// NFR-REL-02 / ARCH §8 demo mode.

test("?demo=1 shows the pill, cleans the URL, replays labeled sample numbers on /live", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page.getByText("Demo mode · mock previews, no crew push")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/live");
  await expect(page.getByText("Demo replay: sample numbers, not real visits")).toBeVisible();
  await expect(page.getByText(/Mesa · 1,520 sq ft · \$2,000 est\./)).toBeVisible();

  await page.goto("/?demo=0");
  await expect(page).toHaveURL(/\/$/); // the flag is cleared when ?demo=0 is read and removed
  await page.goto("/live");
  await expect(page.getByText("Demo replay: sample numbers, not real visits")).toHaveCount(0);
});

test("a demo booking never buzzes the crew and the confirmation says so", async ({ page }) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.20.${test.info().workerIndex}.${Date.now() % 250}`,
  });
  await page.goto("/book?demo=1");
  await expect(page.getByText(/Demo mode/)).toBeVisible();
  await page.locator("label:has(input[name=day]:not([disabled]))").first().click();
  await page.locator("label:has(input[name=slotWindow]:not([disabled]))").first().click();
  const sent = page.waitForRequest((r) => r.url().endsWith("/api/bookings"));
  await page.getByRole("button", { name: "Book a demo yard walk" }).click();
  expect((await sent).headers()["x-demo"]).toBe("1");
  await expect(page.getByRole("region", { name: "Crew notification" })).toContainText("Not delivered", {
    timeout: 15_000,
  });
});

test("with Wi-Fi off after load, the sample-yard rebate and the sample preview still work", async ({
  page,
  context,
}) => {
  await page.goto("/studio?demo=1");
  await expect(page.getByText(/Demo mode/)).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("radio", { name: "Try a sample yard" }).click();
  await expect(page.getByText("Estimated rebate").first()).toBeVisible();
  await expect(page.getByText("$2,400").first()).toBeVisible();
  await context.setOffline(false);
});
