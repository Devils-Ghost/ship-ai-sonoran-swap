import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// SRS §9 (FR-ELIG). The e2e server runs with MOCK_DB=1, so stored results never reach a database.

test("Mesa path: ?city= prefills, a check answer gives 'Check with the city', result is stored", async ({
  page,
}) => {
  await page.goto("/eligibility?city=mesa");
  await page.getByRole("button", { name: "Start the check" }).click();
  await expect(page.getByRole("button", { name: /Mesa/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Mesa/ }).click();

  await expect(page.getByText("Question 2 of 8")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Do you own the home?" })).toBeFocused();
  await page.getByRole("button", { name: "Yes" }).click();
  await page.getByRole("button", { name: "Not sure" }).click(); // water bill from Mesa?
  await page.getByRole("button", { name: "Yes" }).click(); // healthy
  await page.getByRole("button", { name: "No" }).click(); // removed
  await page.getByRole("button", { name: "No, sprinklers on city water" }).click();
  await page.getByRole("button", { name: "No" }).click(); // new home
  await expect(page.getByRole("heading", { name: "Is the grass area at least 500 sq ft?" })).toBeVisible();

  const stored = page.waitForRequest((r) => r.url().endsWith("/api/eligibility") && r.method() === "POST");
  await page.getByRole("button", { name: "Yes" }).click();

  await expect(page.getByRole("heading", { name: "Check with the city" })).toBeVisible();
  await expect(page.getByText("Check the name on your water bill.")).toBeVisible();
  await expect(page.getByText(/Eligibility and payment are decided by the City of Mesa/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Residential Grass-to-Xeriscape/ })).toHaveAttribute(
    "href",
    "https://mesaaz.gov/Xeriscape",
  );
  expect((await stored).postDataJSON()).toEqual({
    programId: "mesa",
    result: "check_city",
    reasonCodes: ["utility:check"],
  });
});

test("removed grass is called out, and the API rejects anything but codes", async ({ page, request }) => {
  await page.goto("/eligibility");
  await page.getByRole("button", { name: "Start the check" }).click();
  await page.getByRole("button", { name: "Phoenix" }).click();
  for (const answer of ["Yes", "Yes", "Yes", "Yes, some or all", "Yes"]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Not eligible right now" })).toBeVisible();
  await expect(page.getByText(/Don't remove more. Contact the city before you continue./)).toBeVisible();

  const res = await request.post("/api/eligibility", {
    data: { programId: "phoenix", result: "likely", reasonCodes: [], answers: { owner: "yes" } },
  });
  expect(res.status()).toBe(400);
});

test("/eligibility has no serious or critical accessibility violations on a result", async ({ page }) => {
  await page.goto("/eligibility");
  await page.getByRole("button", { name: "Start the check" }).click();
  await page.getByRole("button", { name: "Scottsdale" }).click();
  await expect(page.getByRole("heading", { name: "Scottsdale: check the program status" })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});
