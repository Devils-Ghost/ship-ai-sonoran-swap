import { describe, expect, it, vi } from "vitest";
import { bookingNotification, ntfyNotifier } from "./index";

describe("bookingNotification (FR-NOTIF-01)", () => {
  it("formats the full line with an attached estimate", () => {
    expect(
      bookingNotification({
        city: "mesa",
        slotDate: "2026-10-17",
        slotWindow: "morning",
        sqft: 1520,
        rebateAmount: 2000,
      }).body,
    ).toBe(
      "SONORAN SWAP DEMO · Yard walk booked · Mesa · 1,520 sq ft · est. rebate $2,000 · Sat Oct 17 Morning",
    );
  });

  it("leaves out estimate parts when there is none", () => {
    expect(
      bookingNotification({ city: "phoenix", slotDate: "2026-10-19", slotWindow: "afternoon" }).body,
    ).toBe("SONORAN SWAP DEMO · Yard walk booked · Phoenix · Mon Oct 19 Afternoon");
  });
});

describe("ntfyNotifier (FR-NOTIF-02)", () => {
  it("posts to the topic with high priority and the cactus tag", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const ok = await ntfyNotifier("https://ntfy.sh/", "topic-x", fetchImpl).send({ title: "T", body: "B" });
    expect(ok).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://ntfy.sh/topic-x");
    expect(init.body).toBe("B");
    expect(init.headers).toMatchObject({ Title: "T", Priority: "high", Tags: "cactus" });
  });

  it("reports failure instead of throwing", async () => {
    const down = vi.fn(async () => {
      throw new Error("offline");
    });
    expect(await ntfyNotifier("https://ntfy.sh", "t", down).send({ title: "T", body: "B" })).toBe(false);
    const refused = vi.fn(async () => new Response("", { status: 429 }));
    expect(await ntfyNotifier("https://ntfy.sh", "t", refused).send({ title: "T", body: "B" })).toBe(false);
  });
});
