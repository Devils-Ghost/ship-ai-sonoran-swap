import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// SRS §11.3 (FR-LIVE). MOCK_DB=1 serves empty stats; a routed response stands in for real numbers.

test("zero state, QR tagged qr-pitch, and no serious accessibility issues", async ({ page }) => {
  await page.goto("/live");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lawns measured on this site, live.");
  await expect(page.getByText("Waiting for the first estimate.")).toBeVisible();
  await expect(page.getByRole("img", { name: /QR code for .*\/\?src=qr-pitch$/ })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});

test("shows counters, city bars and the ticker from /api/stats", async ({ page }) => {
  await page.route("**/api/stats", (route) =>
    route.fulfill({
      json: {
        ok: true,
        data: {
          since: "2026-10-17T16:00:00.000Z",
          estimates: 3,
          sqft: 3760,
          rebateDollars: 5480,
          renders: 2,
          bookings: 1,
          byCity: { phoenix: 2, mesa: 1, chandler: 0, other: 0 },
          recent: [
            { kind: "booking", at: "2026-10-17T18:05:00.000Z", city: "mesa" },
            { kind: "estimate", at: "2026-10-17T18:00:00.000Z", city: "mesa", sqft: 1520, rebate: 2000 },
          ],
          testing: {
            testers: 0,
            medianMsToEstimate: null,
            completionRate: null,
            variantResults: {
              a: { testers: 0, medianMsToEstimate: null },
              b: { testers: 0, medianMsToEstimate: null },
            },
          },
        },
      },
    }),
  );
  await page.goto("/live");
  await expect(page.getByText("since Sat 9:00 AM", { exact: false })).toBeVisible();
  await expect(page.getByText("Mesa · 1,520 sq ft · $2,000 est.")).toBeVisible();
  await expect(page.getByText("Mesa · yard walk booked (demo)")).toBeVisible();
  await expect(page.locator("dd").filter({ hasText: "$5,480" })).toBeVisible();
});

test("says the numbers are stale after three failed polls (FR-LIVE-04)", async ({ page }) => {
  await page.clock.install();
  await page.route("**/api/stats", (route) => route.fulfill({ status: 500, json: { ok: false } }));
  await page.goto("/live");
  await expect(page.getByText(/Reconnecting/)).toHaveCount(0);
  // Advance poll by poll until the third failure has landed (hydration time varies).
  await expect(async () => {
    await page.clock.runFor(5_000);
    await expect(page.getByText("Reconnecting… numbers may be out of date")).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 15_000 });
});
