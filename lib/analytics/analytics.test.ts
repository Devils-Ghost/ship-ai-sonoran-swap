import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flush, initAnalytics, resetAnalyticsForTests, track } from "./client";
import { cleanProps, isEventName, normalizeSource, rebateBucket, sqftBucket } from "./whitelist";

describe("whitelist (FR-ANL-03)", () => {
  it("knows only listed events", () => {
    expect(isEventName("estimate_shown")).toBe(true);
    expect(isEventName("address_typed")).toBe(false);
    expect(isEventName("toString")).toBe(false);
  });

  it("keeps listed props with the right type and drops the rest", () => {
    expect(
      cleanProps("estimate_shown", {
        city: "mesa",
        sqftBucket: 1500.4,
        rebateBucket: "2000",
        tier: "signature",
        address: "123 Main St",
      }),
    ).toEqual({ city: "mesa", sqftBucket: 1500, tier: "signature" });
    expect(cleanProps("address_selected", { place: "Phoenix" })).toEqual({});
  });

  it("buckets sq ft by 250 and rebates by $500", () => {
    expect(sqftBucket(1240)).toBe(1000);
    expect(sqftBucket(1250)).toBe(1250);
    expect(rebateBucket(2480)).toBe(2000);
    expect(rebateBucket(0)).toBe(0);
  });

  it("normalizes sources (§11.9)", () => {
    expect(normalizeSource("QR-Pitch")).toBe("qr-pitch");
    expect(normalizeSource("referral:news.ycombinator.com")).toBe("referral:news.ycombinator.com");
    expect(normalizeSource("facebook")).toBe("other");
    expect(normalizeSource(undefined)).toBe("direct");
  });
});

describe("client session (FR-ANL-02/05, FR-INS-13)", () => {
  const beacon = vi.fn((..._args: unknown[]) => true);
  beforeEach(() => {
    resetAnalyticsForTests();
    sessionStorage.clear();
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
  });
  afterEach(() => {
    beacon.mockClear();
    window.history.replaceState(null, "", "/");
  });

  it("reads ?src=, ?v= and ?team=1 once, then strips src/team from the address bar", () => {
    window.history.replaceState(null, "", "/?src=linkedin&v=b&team=1&style=modern-desert");
    const s = initAnalytics();
    expect(s).toMatchObject({ source: "linkedin", variant: "b", team: true });
    expect(window.location.search).toBe("?v=b&style=modern-desert");
    expect(sessionStorage.getItem("ss_src")).toBe("linkedin");
  });

  it("utm_source is an alias; unknown sources become other", () => {
    window.history.replaceState(null, "", "/?utm_source=newsletter");
    expect(initAnalytics().source).toBe("other");
  });

  it("defaults to direct with no tag and no referrer", () => {
    expect(initAnalytics()).toMatchObject({ source: "direct", variant: null, team: false });
  });

  it("batches events into one beacon carrying session, source and variant", async () => {
    window.history.replaceState(null, "", "/?src=qr-pitch&v=a");
    track("page_view", { path: "/", variant: "a" });
    track("hero_cta_click", { cta: "see_my_rebate", variant: "a" });
    flush();
    expect(beacon).toHaveBeenCalledTimes(1);
    const blob = beacon.mock.calls[0]?.[1] as Blob;
    const body = JSON.parse(await blob.text()) as { events: Record<string, unknown>[] };
    expect(body.events).toHaveLength(2);
    expect(body.events[0]).toMatchObject({
      name: "page_view",
      source: "qr-pitch",
      variant: "a",
      team: false,
    });
    expect(body.events[0]?.sessionId).toMatch(/^[0-9a-f-]{36}$/);
  });
});
