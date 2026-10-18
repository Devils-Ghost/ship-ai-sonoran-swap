import { expect, test } from "@playwright/test";

// "Notify me when Scottsdale reopens". MOCK_DB=1: sign-ups are validated but not stored.

test("the Scottsdale page signs a visitor up only with a valid email and consent", async ({ page }) => {
  await page.goto("/rebates/scottsdale");
  const form = page.getByRole("region", { name: "Notify me when Scottsdale reopens" });
  await expect(form).toBeVisible();
  await form.getByRole("button", { name: "Notify me" }).click();
  await expect(form.getByText("Enter your email address.")).toBeVisible();
  await expect(form.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByText("Tick the box so we may email you about the reopening.")).toBeVisible();

  await form.getByRole("textbox", { name: "Email" }).fill("pat@example.com");
  await form.getByRole("button", { name: "Notify me" }).click();
  await expect(form.getByText("Tick the box so we may email you about the reopening.")).toBeVisible();

  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Notify me" }).click();
  await expect(form.getByRole("status")).toHaveText(/You're on the list/);
});

test("the alerts API validates on the server and quietly drops honeypot submissions", async ({ request }) => {
  // Each request gets its own client address so the sign-up rate limit (5 per 10 minutes) isn't the subject.
  let n = 0;
  const post = (data: object) =>
    request.post("/api/alerts", { data, headers: { "x-forwarded-for": `203.0.113.${++n}` } });
  const good = { programId: "scottsdale", email: "pat@example.com", consent: true };
  expect((await post(good)).status()).toBe(200);
  expect(await (await post(good)).json()).toEqual({ ok: true, data: { subscribed: true } });
  expect((await post({ ...good, email: "nope" })).status()).toBe(400);
  expect((await post({ ...good, consent: false })).status()).toBe(400);
  expect((await post({ ...good, programId: "phoenix" })).status()).toBe(400);
  expect((await post({ ...good, extra: 1 })).status()).toBe(400);
  const bot = await post({ ...good, hp: "https://spam.example" });
  expect(bot.status()).toBe(200);
});

test("the form appears wherever Scottsdale's between-seasons status does", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Your city", { exact: true }).selectOption("scottsdale");
  await expect(page.getByRole("region", { name: "Notify me when Scottsdale reopens" })).toBeVisible();

  const cards = page.getByRole("region", { name: "What your city pays" });
  await expect(cards.getByRole("link", { name: "Notify me when Scottsdale reopens" })).toHaveAttribute(
    "href",
    "/rebates/scottsdale#reopen-alert",
  );

  await page.goto("/privacy");
  await expect(page.getByText(/Reopening alerts:/)).toBeVisible();
});
