import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// SRS §11.4–11.5 (FR-PROOF-01–03, FR-FB). MOCK_DB=1: feedback is validated but not stored.

test("the Proof drawer opens, shows its tabs, and closes on Escape", async ({ page, isMobile }) => {
  await page.goto("/pricing");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Proof" }).click();
  } else {
    await page.getByRole("button", { name: /^Proof/ }).click();
  }
  const drawer = page.getByRole("dialog", { name: "Proof" });
  await expect(drawer).toBeVisible();
  await expect(page).toHaveURL(/#proof$/);
  for (const tab of ["Quality", "Testing", "How it works", "Limits", "Privacy"]) {
    await expect(drawer.getByRole("tab", { name: tab })).toBeVisible();
  }
  await expect(drawer.getByRole("table", { name: "Lighthouse reports" })).toBeVisible();
  await drawer.getByRole("tab", { name: "Limits" }).click();
  await expect(drawer.getByText(/concept business. There is no crew yet/)).toBeVisible();
  await expect(drawer.getByRole("link", { name: /Growth insights/ })).toHaveAttribute("href", "/insights");

  const { violations } = await new AxeBuilder({ page }).include("[role=dialog]").analyze();
  expect(
    violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id),
  ).toEqual([]);

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  // Focus goes back to the Proof button (desktop) or the page content (opened from the closed menu).
  await expect(
    isMobile ? page.locator("main#main") : page.getByRole("button", { name: /^Proof/ }),
  ).toBeFocused();
  await expect(page).not.toHaveURL(/#proof/);
});

test("a #proof link opens the drawer on load", async ({ page }) => {
  await page.goto("/how-it-works#proof");
  await expect(page.getByRole("dialog", { name: "Proof" })).toBeVisible();
});

test("launch notes: sections, testing empty state, and feedback with consent", async ({ page }) => {
  await page.goto("/launch-notes");
  for (const h of ["What we shipped", "Quality reports", "User testing", "Honest limits", "Send feedback"]) {
    await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
  }
  await expect(page.getByText(/No user-test sessions yet/)).toBeVisible();

  await page.getByRole("button", { name: "Send feedback" }).click();
  await expect(page.getByText("Write a message first.")).toBeVisible();

  await page.getByLabel("Your feedback").fill("The rebate number was clear.");
  await page.getByLabel(/Email \(optional/).fill("tester@example.com");
  await page.getByRole("button", { name: "Send feedback" }).click();
  await expect(page.getByText(/Tick the box so we may reply/)).toBeVisible();
  await page.getByRole("checkbox", { name: /You may use this email/ }).check();

  const sent = page.waitForRequest((r) => r.url().endsWith("/api/feedback"));
  await page.getByRole("button", { name: "Send feedback" }).click();
  expect((await sent).postDataJSON()).toEqual({
    message: "The rebate number was clear.",
    consent: true,
    page: "/launch-notes",
    email: "tester@example.com",
  });
  await expect(page.getByText("Thanks, received.")).toBeVisible();
});

test("feedback API: email needs consent; the honeypot looks successful", async ({ request }) => {
  const headers = { "x-forwarded-for": `198.19.${test.info().workerIndex}.${Date.now() % 250}` };
  const noConsent = await request.post("/api/feedback", {
    data: { message: "hi", email: "a@b.co", consent: false, page: "/" },
    headers,
  });
  expect(noConsent.status()).toBe(400);
  const bot = await request.post("/api/feedback", {
    data: { message: "buy now", consent: false, page: "/", hp: "http://spam" },
    headers,
  });
  expect((await bot.json()).ok).toBe(true);
});
