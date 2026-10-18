import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Requests to this host are "our server" for the privacy checks.
const OUR_HOST = new URL(process.env.E2E_BASE_URL ?? "http://localhost").hostname;

// FR-EST-13: when Mapbox refuses (bad token, allowance used up), search moves to Photon and the map to
// MapLibre over USGS imagery, with no gap for the visitor. Every provider is a fixture: no network.

const TILE = readFileSync("public/samples/yard-1-before.jpg");

const PHOTON_FIXTURE = {
  features: [
    {
      geometry: { coordinates: [-112.0773, 33.4486] },
      properties: {
        housenumber: "200",
        street: "West Washington Street",
        name: "Phoenix City Hall",
        city: "Phoenix",
        state: "Arizona",
        postcode: "85003",
      },
    },
  ],
};

type Seen = { mapbox: string[]; photon: string[]; usgs: string[]; ours: string[] };

async function mockProviders(page: Page, mapbox: { geocode: number; style: number }): Promise<Seen> {
  const seen: Seen = { mapbox: [], photon: [], usgs: [], ours: [] };
  page.on("request", (req) => {
    const url = new URL(req.url());
    if (url.hostname === OUR_HOST) {
      seen.ours.push(`${req.url()} ${req.postData() ?? ""}`);
    }
  });
  await page.route("https://api.mapbox.com/**", (route) => {
    const url = route.request().url();
    seen.mapbox.push(url);
    const status = url.includes("/search/geocode/") ? mapbox.geocode : mapbox.style;
    if (status !== 200) return route.fulfill({ status, json: { message: "Not Authorized - Invalid Token" } });
    return route.fulfill({
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
    });
  });
  await page.route("https://*.mapbox.com/**", (route) => route.fulfill({ status: 401, body: "" }));
  await page.route("https://photon.komoot.io/**", (route) => {
    seen.photon.push(route.request().url());
    return route.fulfill({ json: PHOTON_FIXTURE });
  });
  await page.route(/nationalmap\.gov/, (route) => {
    seen.usgs.push(route.request().url());
    return route.fulfill({ body: TILE, contentType: "image/jpeg" });
  });
  return seen;
}

const backupNote = (page: Page) => page.getByText(/Backup map: public aerial photos from the USGS/);
const freeCanvas = (page: Page) => page.locator(".maplibregl-canvas");

test("refused search retries on Photon and opens the backup map; nothing reaches our server", async ({
  page,
}) => {
  const seen = await mockProviders(page, { geocode: 401, style: 401 });
  await page.goto("/studio");
  const search = page.getByRole("combobox", { name: "Find your home" });
  await search.fill("200 W Washington");

  // One Photon result for the address even though OSM lists several businesses there.
  const option = page.getByRole("option", { name: /200 West Washington Street, Phoenix/ });
  await expect(option).toHaveCount(1);
  await expect(page.getByText(/© OpenStreetMap contributors/)).toBeVisible();
  await option.click();

  await expect(backupNote(page)).toBeVisible();
  await expect(freeCanvas(page)).toBeVisible();
  await expect.poll(() => seen.usgs.some((u) => u.includes("USGSNAIPImagery"))).toBe(true);
  // The refused token is never tried again for the map itself.
  expect(seen.mapbox.filter((u) => u.includes("/styles/"))).toEqual([]);
  expect(new URL(seen.photon[0] ?? "x:").searchParams.get("q")).toBe("200 W Washington");

  // The city still comes from the geocoder (FR-EST-08).
  await expect(page.getByRole("combobox", { name: "Your water bill comes from" })).toHaveValue("phoenix");

  const leaks = seen.ours.filter((r) => /washington|street|85003|-112\.07|33\.44|coordinates/i.test(r));
  expect(leaks).toEqual([]);
});

test("a refused Mapbox map falls back to the free map, and outlining still works", async ({ page }) => {
  const seen = await mockProviders(page, { geocode: 200, style: 401 });
  await page.goto("/studio");
  await page.getByRole("button", { name: "Show the map" }).click();

  await expect(backupNote(page)).toBeVisible();
  await expect(page.getByText("Map unavailable")).toHaveCount(0);
  await expect.poll(() => seen.usgs.length).toBeGreaterThan(0);

  // Outline a square in the middle of the map and close it on the first point.
  const canvas = freeCanvas(page);
  await expect(canvas).toBeVisible();
  await page.getByRole("button", { name: "Dismiss hint" }).click();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("map canvas has no box");
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const corners: [number, number][] = [
    [cx - 60, cy - 60],
    [cx + 60, cy - 60],
    [cx + 60, cy + 60],
    [cx - 60, cy + 60],
    [cx - 60, cy - 60],
  ];
  for (const [x, y] of corners) {
    await page.mouse.click(x, y);
    await page.waitForTimeout(150); // let a click settle so two are not read as a double-click
  }
  await expect(page.getByText(/^Shape 1:/)).toBeVisible();
  await expect(page.getByText(/^Total:/)).toContainText("sq ft");

  // FR-EST-14: the prep sheet gets the map view through sessionStorage, never through our server.
  await page.getByRole("link", { name: "Print prep sheet" }).click();
  await expect(page).toHaveURL(/\/studio\/prep\?city=/);
  const snapshot = page.getByRole("img", { name: /Satellite view with the outlined grass/ });
  await expect(snapshot).toBeVisible();
  expect(await snapshot.getAttribute("src")).toMatch(/^data:image\/jpeg;base64,/);
  expect(seen.ours.some((r) => r.includes("data:image"))).toBe(false);
});
