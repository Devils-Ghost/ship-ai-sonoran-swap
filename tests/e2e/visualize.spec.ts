import path from "node:path";
import { expect, test } from "@playwright/test";

// The e2e web server runs with MOCK_IMAGE_PROVIDER=1, so no request reaches an image provider.
const FIXTURE = path.join(process.cwd(), "public", "samples", "yard-2-before.jpg");

// /api/render allows 5 renders per 10 minutes per IP; give each test its own address so they stay independent.
let ipCounter = 0;
test.beforeEach(async ({ page }, info) => {
  ipCounter += 1;
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.51.100.${(info.workerIndex * 40 + ipCounter) % 250}`,
  });
});

test("sample yard path shows a labeled before/after instantly and switches styles", async ({ page }) => {
  await page.goto("/visualize");
  await page.getByRole("button", { name: "Use sample yard 2" }).click();

  const result = page.getByRole("region", { name: /Sonoran Native example/ });
  await expect(result).toBeVisible();
  await expect(page.getByText("AI-generated sample yard. Not a real home.")).toBeVisible();
  await expect(page.getByText("AI concept rendering. Actual results vary.").first()).toBeVisible();
  await expect(result.locator("img").first()).toHaveAttribute("src", /yard-2-sonoran-native\.jpg/);

  await page.getByRole("radio", { name: /Modern Desert/ }).click();
  await expect(
    page
      .getByRole("region", { name: /Modern Desert example/ })
      .locator("img")
      .first(),
  ).toHaveAttribute("src", /yard-2-modern-desert\.jpg/);
  // FR-VIS-09: the palette comes from plants.json.
  await expect(page.getByRole("complementary", { name: "Modern Desert plant palette" })).toContainText(
    "Hesperaloe parviflora",
  );
});

test("?style= preselects a style", async ({ page }) => {
  await page.goto("/visualize?style=pollinator-garden");
  await expect(page.getByRole("radio", { name: /Pollinator Garden/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("upload path renders through the API with progress and an honest label (mock provider)", async ({
  page,
}) => {
  await page.goto("/visualize");
  await page.locator("input[type=file]:not([capture])").setInputFiles(FIXTURE);
  await expect(page.getByText("Your photo is ready. It stays in this browser tab.")).toBeVisible();

  const request = page.waitForRequest((r) => r.url().endsWith("/api/render") && r.method() === "POST");
  await page.getByRole("button", { name: "Create my Sonoran Native preview" }).click();
  await expect(page.getByText("Uploading…")).toBeVisible();

  // Multipart upload (the preprocessed JPEG; preprocessing itself is unit-tested).
  expect((await request).headers()["content-type"]).toMatch(/^multipart\/form-data/);

  await expect(page.getByText("Example rendering (live preview unavailable)")).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByRole("slider", { name: "Compare before and after" })).toBeVisible();
});

test("cancel returns to the photo without a result", async ({ page }) => {
  // Hold the render open so the cancel is deterministic; the abort ends the request.
  await page.route("**/api/render", () => new Promise(() => {}));
  await page.goto("/visualize");
  await page.locator("input[type=file]:not([capture])").setInputFiles(FIXTURE);
  await page.getByRole("button", { name: /Create my .* preview/ }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Uploading…")).toBeHidden();
  await expect(page.getByRole("slider", { name: "Compare before and after" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Create my .* preview/ })).toBeVisible();
});

test("non-photos are refused in the browser", async ({ page }) => {
  await page.goto("/visualize");
  await page.locator("input[type=file]:not([capture])").setInputFiles({
    name: "notes.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4"),
  });
  await expect(page.getByText("That file isn't a photo we can use. Try a JPEG, PNG or WebP.")).toBeVisible();
});

test.describe("POST /api/render", () => {
  test("rejects files that aren't images even when labeled as JPEG", async ({ request }) => {
    const res = await request.post("/api/render", {
      multipart: {
        style: "sonoran-native",
        image: { name: "fake.jpg", mimeType: "image/jpeg", buffer: Buffer.from("not really a jpeg") },
      },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_IMAGE");
  });

  test("rejects unknown styles", async ({ request }) => {
    const res = await request.post("/api/render", {
      multipart: {
        style: "tropical",
        image: { name: "y.jpg", mimeType: "image/jpeg", buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]) },
      },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe("INVALID_INPUT");
  });
});
