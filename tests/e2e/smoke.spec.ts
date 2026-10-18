import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home renders one H1, the concept disclosure and no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");

  await expect(page.locator("h1")).toHaveCount(1);
  // FR-DISC: the concept disclosure renders while business.mode === "concept".
  await expect(page.getByText("Concept business", { exact: true })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("Not affiliated with any city");
  expect(errors).toEqual([]);
});

test("home has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});
