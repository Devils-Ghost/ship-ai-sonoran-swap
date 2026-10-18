import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// FR-INS-01–13. MOCK_DB=1 serves empty insights; a routed response stands in for real numbers.
const rate = (num: number, den: number) => ({ num, den, value: den >= 10 ? num / den : null });

test("empty period: no empty panel headings, one honest line; static panels render; no a11y blockers", async ({
  page,
}) => {
  await page.goto("/insights");
  await expect(page.getByText("Live data from this site. Team visits excluded.")).toBeVisible();
  await expect(page.getByText("No data yet for this period.")).toHaveCount(1);
  for (const panel of [
    "The funnel",
    "Click-through",
    "Headline test",
    "Where visitors come from",
    "Who's measuring",
    "Feature health",
    "What we changed because of data",
  ]) {
    await expect(page.getByRole("heading", { name: panel })).toHaveCount(0);
  }
  await expect(
    page.getByText(/Structured data: Article, BreadcrumbList, FAQPage, WebPage, WebSite/),
  ).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id),
  ).toEqual([]);
});

test("numbers: funnel with biggest drop, small-number honesty, and the range chips refetch", async ({
  page,
}) => {
  const asked: string[] = [];
  await page.route("**/api/insights?*", (route) => {
    asked.push(new URL(route.request().url()).searchParams.get("range") ?? "");
    const steps = [
      ["sessions", "Visited", 40],
      ["started", "Started an estimate", 30],
      ["estimated", "Saw a rebate", 24],
      ["previewed", "Previewed a yard", 6],
      ["eligibility", "Checked eligibility", 4],
      ["booked", "Booked a yard walk", 2],
    ] as const;
    return route.fulfill({
      json: {
        ok: true,
        data: {
          range: "launch",
          since: "2030-03-16T16:00:00.000Z",
          funnel: {
            steps: steps.map(([id, label, count], i) => ({
              id,
              label,
              count,
              step: rate(count, i === 0 ? 40 : (steps[i - 1]?.[2] ?? 0)),
              overall: rate(count, 40),
            })),
            biggestDrop: "previewed",
          },
          cta: { impressions: 40, clicks: 12, ctr: rate(12, 40), byVariant: [] },
          ab: {
            a: {
              variant: "a",
              sessions: 22,
              ctr: rate(8, 22),
              medianMsToRebate: 21000,
              fiveSecond: { pass: 3, fail: 1 },
            },
            b: {
              variant: "b",
              sessions: 18,
              ctr: rate(4, 18),
              medianMsToRebate: 27000,
              fiveSecond: { pass: 2, fail: 2 },
            },
            verdict: null,
          },
          sources: [{ source: "qr-screen", sessions: 9, estimated: rate(6, 9), bookings: 1 }],
          audience: { byCity: [], medianSqftBucket: null, medianRebateBucket: null, tiers: [], styles: [] },
          health: {
            renders: 0,
            renderSuccess: rate(0, 0),
            medianRenderMs: null,
            galleryShare: rate(0, 0),
            entryPaths: [],
            mapFailures: 0,
          },
        },
      },
    });
  });
  await page.goto("/insights");
  const funnel = page.getByRole("region", { name: "The funnel" });
  await expect(funnel.getByRole("row", { name: /Previewed a yard/ })).toContainText("Biggest drop-off");
  await expect(funnel.getByRole("row", { name: /Started an estimate/ })).toContainText("75%");
  // Every share is of all visitors (40), so no row borrows the previous row's count.
  await expect(funnel.getByRole("row", { name: /Checked eligibility/ })).toContainText("10%");
  await expect(funnel.getByRole("columnheader", { name: "From previous" })).toHaveCount(0);
  await expect(funnel.getByText(/Steps aren.t strictly in order/)).toBeVisible();
  await expect(
    page.getByText(/Headline B is shown only to visitors who arrive through a test link/),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Where visitors come from" })).toContainText(
    "QR (on screen)",
  );
  await expect(page.getByText("Too little data to call a winner yet.")).toBeVisible();
  // Panels with no data for the period stay hidden instead of showing an empty heading.
  await expect(page.getByRole("heading", { name: "Who's measuring" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Feature health" })).toHaveCount(0);
  await expect(page.getByText("No data yet for this period.")).toHaveCount(0);

  await page.getByRole("radio", { name: "Last hour" }).click();
  await expect.poll(() => asked).toContain("hour");
});
