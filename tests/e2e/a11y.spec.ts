import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ROUTES } from "@/lib/routes";

// QUALITY C7 / NFR-A11Y-01: 0 serious or critical axe violations, on every route, at both viewports.
test("every route has no serious or critical accessibility violations", async ({ page }) => {
  test.setTimeout(180_000);
  const found: string[] = [];
  for (const route of [...ROUTES.map((r) => r.path), "/studio/prep?city=mesa&sqft=1520&tier=signature"]) {
    await page.goto(route);
    await page.waitForLoadState("load");
    const { violations } = await new AxeBuilder({ page }).analyze();
    for (const v of violations.filter((x) => x.impact === "serious" || x.impact === "critical")) {
      found.push(
        `${route} ${v.id}: ${v.help} (${v.nodes
          .map((n) => n.target.join(" "))
          .slice(0, 3)
          .join(" | ")})`,
      );
    }
  }
  expect(found).toEqual([]);
});

// QUALITY C10: the core journey works without a mouse, with a visible focus ring at each stop.
test("keyboard only: home → sample-yard rebate → book a demo walk", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard journey runs on desktop");
  await page.setExtraHTTPHeaders({
    "x-forwarded-for": `198.21.${test.info().workerIndex}.${Date.now() % 250}`,
  });
  await page.goto("/");

  const tabTo = async (name: RegExp, max = 40) => {
    for (let i = 0; i < max; i += 1) {
      await page.keyboard.press("Tab");
      const label = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return ""; // between pages, focus can sit on <body>
        // Radios are named by their wrapping <label>.
        const text = el.innerText || el.closest("label")?.innerText || "";
        return `${el.getAttribute("aria-label") ?? ""} ${text}`.trim();
      });
      if (name.test(label)) {
        // A visible ring: an outline on the element, or on its label (the booking radio cards).
        const visible = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const ring = (e: Element | null) => !!e && getComputedStyle(e).outlineStyle !== "none";
          return ring(el) || ring(el.closest("label"));
        });
        expect(visible, `focus ring on "${label}" (matched ${name})`).toBe(true);
        return;
      }
    }
    throw new Error(`never reached ${name}`);
  };

  await tabTo(/^See my rebate$/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/studio/);

  await tabTo(/Measure on the map/);
  // Radix moves roving focus on the next tick, so wait for it like a person would.
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "I know my square footage" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Try a sample yard" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: "Try a sample yard" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByText("Estimated rebate").first()).toBeVisible();

  await tabTo(/Book a free yard walk/, 80);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/book/);

  // Radios: Tab into the group, arrow keys skip full days and taken windows.
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Book a free yard walk.");
  // The picker streams in after the static intro (it reads today's date per request).
  await expect(page.getByText("2. Pick a day")).toBeVisible();
  await tabTo(/^(Sat|Mon|Tue|Wed|Thu|Fri)\b/);
  await page.keyboard.press("Space");
  await tabTo(/Morning|Afternoon/);
  await page.keyboard.press("Space");
  await tabTo(/Book a demo yard walk/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/book\/confirmed\//, { timeout: 15_000 });
});
