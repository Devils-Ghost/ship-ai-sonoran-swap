import { expect, test, type Page, type Request } from "@playwright/test";

// FR-ANL-02–07. Captures what the browser sends to /api/events (MOCK_DB=1: nothing is stored).

type SentEvent = {
  name: string;
  props: Record<string, unknown>;
  source: string;
  variant: string | null;
  team: boolean;
};

/**
 * Playwright can't read sendBeacon bodies, so the beacon is removed and the client's fetch fallback carries
 * the same payload (the beacon path itself is unit-tested).
 */
function captureEvents(page: Page): SentEvent[] {
  void page.addInitScript(() => Object.defineProperty(navigator, "sendBeacon", { value: undefined }));
  const sent: SentEvent[] = [];
  page.on("request", (r: Request) => {
    if (!r.url().endsWith("/api/events") || r.method() !== "POST") return;
    const body = r.postDataBuffer()?.toString("utf8");
    if (body) sent.push(...(JSON.parse(body) as { events: SentEvent[] }).events);
  });
  return sent;
}

test("tagged home visit: source read and stripped, page view, variant, CTA impression and click", async ({
  page,
}) => {
  const sent = captureEvents(page);
  await page.goto("/?src=qr-pitch&v=b");
  await expect(page).toHaveURL(/\/\?v=b$/);
  await expect
    .poll(() => sent.map((e) => e.name))
    .toEqual(expect.arrayContaining(["page_view", "headline_variant", "cta_impression"]));
  expect(sent.every((e) => e.source === "qr-pitch" && e.variant === "b" && e.team === false)).toBe(true);
  expect(sent.find((e) => e.name === "cta_impression")?.props).toEqual({
    cta: "see_my_rebate",
    variant: "b",
  });

  await page.getByRole("main").getByRole("link", { name: "See my rebate" }).first().click();
  await expect(page).toHaveURL(/\/studio/);
  // The source sticks for the whole tab.
  await expect
    .poll(() => sent.filter((e) => e.name === "page_view").map((e) => e.props.path))
    .toContain("/studio");
  expect(sent.find((e) => e.name === "hero_cta_click")?.source).toBe("qr-pitch");
});

test("studio sample path sends estimator_start, sample_used and a bucketed estimate_shown", async ({
  page,
}) => {
  const sent = captureEvents(page);
  await page.goto("/studio?team=1");
  await page.getByRole("radio", { name: "Try a sample yard" }).click();
  await expect
    .poll(() => sent.map((e) => e.name), { timeout: 10_000 })
    .toEqual(expect.arrayContaining(["estimator_start", "sample_used", "estimate_shown"]));
  const shown = sent.find((e) => e.name === "estimate_shown");
  expect(shown?.team).toBe(true);
  expect(Object.keys(shown?.props ?? {}).sort()).toEqual(["city", "rebateBucket", "sqftBucket", "tier"]);
  expect((shown?.props.sqftBucket as number) % 250).toBe(0);
});

test("the events API keeps only whitelisted names and props", async ({ request }) => {
  const res = await request.post("/api/events", {
    data: {
      events: [
        {
          name: "page_view",
          props: { path: "/", variant: "a", email: "x@y.z" },
          path: "/?q=secret",
          sessionId: "abcdefgh-1234",
        },
        { name: "address_typed", props: { text: "123 Main" } },
      ],
    },
  });
  expect(await res.json()).toEqual({ ok: true, data: { accepted: 1 } });
});
