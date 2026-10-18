import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// SRS §11.1–11.2. The e2e server runs with MOCK_DB=1 and MOCK_NOTIFY=1: bookings live in memory and no push
// leaves the machine. Bookings allow 10 per minute per IP, so each test uses its own address.
let ipCounter = 0;
test.beforeEach(async ({ page }, info) => {
  ipCounter += 1;
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `203.0.113.${(info.workerIndex * 40 + ipCounter) % 250}`,
  });
});

test("pick a day and time, book, and land on the confirmation", async ({ page }) => {
  await page.goto("/book");
  await expect(
    page.getByText("This is a demonstration booking. No one will visit.", { exact: true }),
  ).toBeVisible();

  // Taken windows are disabled and labeled (FR-BOOK-03).
  await page.locator("label:has(input[name=day]:not([disabled]))").first().click();
  await page.locator("label:has(input[name=slotWindow]:not([disabled]))").first().click();
  await page.getByLabel("3. Your city").selectOption("mesa");

  const request = page.waitForRequest((r) => r.url().endsWith("/api/bookings") && r.method() === "POST");
  await page.getByRole("button", { name: "Book a demo yard walk" }).click();
  const body = (await request).postDataJSON() as Record<string, unknown>;
  expect(Object.keys(body).sort()).toEqual(["city", "idempotencyKey", "slotDate", "slotWindow"]);
  expect(body.city).toBe("mesa");

  await expect(page).toHaveURL(/\/book\/confirmed\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /^You're booked for \w+day, \w{3} \d{1,2}, (morning|afternoon)\.$/,
  );
  await expect(
    page.getByText(/^This is a demonstration booking\. No one will visit\. This shows/),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Crew notification" })).toContainText(
    "Sent to the crew's phone",
  );
  await expect(page.locator("[aria-current=step]")).toContainText("Measure");
  await expect(page.getByRole("button", { name: "Add to calendar" })).toBeVisible();

  const { violations } = await new AxeBuilder({ page }).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});

test("asks for a day and time before submitting", async ({ page }) => {
  await page.goto("/book");
  await page.getByRole("button", { name: "Book a demo yard walk" }).click();
  await expect(page.getByText("Pick a day and a time first.")).toBeVisible();
});

test("the API is idempotent, rejects taken slots and personal fields", async ({ page, request }) => {
  await page.goto("/book");
  const date = await page.locator("input[name=day]:not([disabled])").first().getAttribute("value");
  await page.locator("label:has(input[name=day]:not([disabled]))").first().click();
  const window = await page.locator("input[name=slotWindow]:not([disabled])").first().getAttribute("value");
  const headers = { "x-forwarded-for": `198.18.${test.info().workerIndex}.${Date.now() % 250}` };

  const payload = {
    slotDate: date,
    slotWindow: window,
    city: "phoenix",
    idempotencyKey: `e2e-${Date.now()}-abcdef`,
  };
  const first = await (await request.post("/api/bookings", { data: payload, headers })).json();
  const again = await (await request.post("/api/bookings", { data: payload, headers })).json();
  expect(first.ok).toBe(true);
  expect(again.data.id).toBe(first.data.id);

  const pii = await request.post("/api/bookings", {
    data: { ...payload, idempotencyKey: `e2e-${Date.now()}-pii000`, partner: { firstName: "A" } },
    headers,
  });
  expect(pii.status()).toBe(400);

  const past = await request.post("/api/bookings", {
    data: { ...payload, slotDate: "2020-01-01", idempotencyKey: `e2e-${Date.now()}-past00` },
    headers,
  });
  expect(past.status()).toBe(409);
  expect((await past.json()).error.code).toBe("SLOT_UNAVAILABLE");

  const read = await (await request.get(`/api/bookings/${first.data.id}`)).json();
  expect(read.data).toMatchObject({ id: first.data.id, city: "phoenix", notified: true });
  expect((await request.get("/api/bookings/not-a-booking")).status()).toBe(404);
});

test("an unknown confirmation shows the 404 page", async ({ page }) => {
  await page.goto("/book/confirmed/00000000-0000-4000-8000-000000000000");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page dried up.");
});
