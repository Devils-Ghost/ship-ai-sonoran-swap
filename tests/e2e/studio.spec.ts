import { expect, test, type Page } from "@playwright/test";

// Requests to this host are "our server" for the privacy checks.
const OUR_HOST = new URL(process.env.E2E_BASE_URL ?? "http://localhost").hostname;

const results = (page: Page) => page.getByRole("region", { name: "Your results" });

test("sample path shows the Phoenix result for 1,200 sq ft in under 2 s (§8 AC)", async ({ page }) => {
  await page.goto("/studio");
  const t0 = Date.now();
  await page.getByRole("radio", { name: "Try a sample yard" }).click();
  await expect(results(page)).toContainText("$2,400");
  await expect(results(page)).toContainText("$2.00 × 1,200 sq ft (Phoenix)");
  expect(Date.now() - t0).toBeLessThan(2000);
});

test("manual path computes boundary cases from SRS §7.5", async ({ page }) => {
  await page.goto("/studio");
  await page.getByRole("radio", { name: "I know my square footage" }).click();
  const sqft = page.getByLabel("Grass area (sq ft)");
  const city = page.getByRole("combobox", { name: "Your water bill comes from" });

  const cases: [string, string, string][] = [
    ["City of Phoenix", "1240", "$2,480"],
    ["City of Phoenix", "249", "Below Phoenix's 250 sq ft minimum"],
    ["City of Chandler", "1333", "$2,000"],
    ["City of Chandler", "501", "$765"],
    ["City of Mesa", "999", "$1,000"],
    ["City of Mesa", "1000", "$1,500"],
    ["City of Scottsdale", "1200", "Between seasons"],
    ["City of Tempe", "1200", "We don't have Tempe's program in our data yet"],
  ];
  for (const [cityName, area, expected] of cases) {
    await city.selectOption({ label: cityName });
    await sqft.fill(area);
    await expect(results(page), `${cityName} ${area}`).toContainText(expected);
  }
  // Every result carries the approval warning (FR-REB-12) and, for programs, the source and date.
  await city.selectOption({ label: "City of Phoenix" });
  await sqft.fill("1200");
  await expect(results(page)).toContainText("Don't remove any grass until Phoenix approves");
  await expect(results(page)).toContainText("checked Oct 15, 2026");
});

test("a shared link opens straight to results", async ({ page }) => {
  await page.goto("/studio?sqft=1240&city=mesa&tier=essentials");
  await expect(results(page)).toContainText("$1,500");
  await expect(page.getByRole("radio", { name: "Essentials" })).toHaveAttribute("aria-checked", "true");
});

test("home quick estimate links to the studio with its numbers", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("$2.00 × 1,200 sq ft")).toBeVisible();
  await page.getByRole("link", { name: "Measure my actual lawn →" }).click();
  await expect(page).toHaveURL(/\/studio\?sqft=1200&city=phoenix/);
  await expect(results(page)).toContainText("$2,400");
});

test("no address or coordinates ever reach our server (§8 AC, AGENTS §2.4)", async ({ page }) => {
  const ourRequests: string[] = [];
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.hostname === OUR_HOST) {
      ourRequests.push(`${req.url()} ${req.postData() ?? ""}`);
    }
  });
  // Fixture geocoders so the test never depends on Mapbox or Photon (used when there is no token).
  await page.route("https://photon.komoot.io/**", (route) =>
    route.fulfill({
      json: {
        features: [
          {
            geometry: { coordinates: [-112.0773, 33.4486] },
            properties: { housenumber: "200", street: "West Washington Street", city: "Phoenix" },
          },
        ],
      },
    }),
  );
  await page.route("https://api.mapbox.com/search/geocode/**", (route) =>
    route.fulfill({
      json: {
        features: [
          {
            geometry: { coordinates: [-112.0773, 33.4486] },
            properties: {
              full_address: "200 West Washington Street, Phoenix, Arizona 85003, United States",
              context: { place: { name: "Phoenix" } },
            },
          },
        ],
      },
    }),
  );

  await page.goto("/studio");
  const search = page.getByRole("combobox", { name: "Find your home" });
  await search.fill("200 W Washington");
  await page.getByRole("option", { name: /200 West Washington Street/ }).click();
  await expect(search).toHaveValue(/200 West Washington Street/);
  await page.getByRole("radio", { name: "Try a sample yard" }).click();
  await expect(results(page)).toContainText("$2,400");
  await page.waitForResponse((r) => r.url().includes("/api/estimates"));

  const leaks = ourRequests.filter((r) =>
    /washington|street|85003|-112\.07|33\.44|coordinates|\blng\b|\blat\b/i.test(r),
  );
  expect(leaks).toEqual([]);
});

test.describe("POST /api/estimates", () => {
  test("recomputes on the server and ignores client amounts", async ({ request }) => {
    const res = await request.post("/api/estimates", {
      data: { city: "chandler", sqft: 1333, source: "manual", tier: "signature" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.rebate.amount).toBe(2000);
    expect(body.data.net).toEqual({ low: 11330, high: 17995 });
  });

  test("rejects addresses, coordinates and invented amounts", async ({ request }) => {
    for (const extra of [{ address: "200 W Washington St" }, { lat: 33.4 }, { rebateAmount: 99999 }]) {
      const res = await request.post("/api/estimates", {
        data: { city: "phoenix", sqft: 1200, source: "manual", tier: "signature", ...extra },
      });
      expect(res.status(), JSON.stringify(extra)).toBe(400);
      expect((await res.json()).error.code).toBe("INVALID_INPUT");
    }
  });
});
