import { expect, test } from "@playwright/test";

// FR-VIS-07: on touch screens a horizontal drag must move the divider, not get claimed by the browser as
// a pan (which cancels the pointer). Real touch events through CDP, since mouse drags don't reproduce it.
test("dragging the before/after divider with a finger moves it", async ({ page, browserName }, info) => {
  test.skip(browserName !== "chromium" || info.project.name !== "mobile", "CDP touch, phone viewport");
  await page.goto("/");
  const handle = page.getByRole("slider", { name: "Compare before and after" });
  await handle.scrollIntoViewIfNeeded();
  await expect(handle).toHaveAttribute("aria-valuenow", "50"); // intro glide finished
  const box = await handle.boundingBox();
  if (!box) throw new Error("no handle");
  const y = box.y + box.height / 2;
  const x0 = box.x + box.width / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", x: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
  await touch("touchStart", x0);
  for (let i = 1; i <= 10; i++) await touch("touchMove", x0 - i * 10);
  await touch("touchEnd", x0 - 100);
  const now = Number(await handle.getAttribute("aria-valuenow"));
  expect(now).toBeLessThan(35);
});
