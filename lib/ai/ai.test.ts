import { afterEach, describe, expect, it, vi } from "vitest";
import { parseServerEnv } from "@/lib/env";
import { getImageProvider, ProviderError } from "./index";
import { bumpMemoryCount, liveRendersToday, utcDayStart } from "./daily-cap";
import { buildPrompt, STYLE_SLUGS } from "./prompt";
import { cloudflareProvider, fluxSize } from "./providers/cloudflare";
import { mockProvider } from "./providers/mock";

const env = (extra: Record<string, string> = {}) =>
  parseServerEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000", MOCK_DB: "1", MOCK_NOTIFY: "1", ...extra });

const input = (signal = new AbortController().signal) => ({
  image: new Uint8Array([0xff, 0xd8, 0xff]),
  mime: "image/jpeg" as const,
  width: 1200,
  height: 900,
  prompt: "p",
  style: "sonoran-native",
  signal,
});

afterEach(() => vi.restoreAllMocks());

describe("prompt (SRS §10.1)", () => {
  it("fills every placeholder for every style", () => {
    for (const slug of STYLE_SLUGS) {
      const p = buildPrompt(slug);
      expect(p).not.toMatch(/\{(name|materials|plantsPrompt)\}/);
      expect(p).toMatch(/^Edit this exact photograph\./);
      expect(p).toContain("Do not add artificial turf");
    }
  });
});

describe("provider selection (FR-VIS-05)", () => {
  it("defaults to the gallery and honors mocks and demo mode", () => {
    expect(getImageProvider(env()).name).toBe("gallery");
    expect(getImageProvider(env({ MOCK_IMAGE_PROVIDER: "1" })).name).toBe("mock");
    expect(getImageProvider(env(), { demo: true }).name).toBe("mock");
  });

  it("uses Cloudflare only when fully configured", () => {
    const cf = env({
      IMAGE_PROVIDER: "cloudflare",
      CLOUDFLARE_ACCOUNT_ID: "a",
      CLOUDFLARE_API_TOKEN: "t",
      IMAGE_MODEL: "m",
    });
    expect(getImageProvider(cf)).toMatchObject({ name: "cloudflare", live: true });
  });

  it("maps gemini to the gallery (no free image quota)", () => {
    const gemini = env({ IMAGE_PROVIDER: "gemini", GEMINI_API_KEY: "k", IMAGE_MODEL: "m" });
    expect(getImageProvider(gemini).name).toBe("gallery");
  });
});

describe("cloudflare provider", () => {
  const provider = cloudflareProvider({ accountId: "acct", apiToken: "tok", model: "@cf/x/y" });

  it("sends the FLUX.2 multipart fields and decodes the image", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json({ result: { image: Buffer.from([1, 2, 3]).toString("base64") } }));
    const out = await provider.edit(input());
    expect(out).toMatchObject({ kind: "live", mime: "image/jpeg" });
    expect(Array.from(out.image)).toEqual([1, 2, 3]);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe("https://api.cloudflare.com/client/v4/accounts/acct/ai/run/@cf/x/y");
    const form = init?.body as FormData;
    expect(form.get("prompt")).toBe("p");
    expect(form.get("width")).toBe("1200");
    expect(form.get("height")).toBe("896"); // snapped to 16 px
    expect(form.get("input_image_0")).toBeInstanceOf(Blob);
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("maps safety refusals and other failures to provider codes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({ errors: [{ code: 3030, message: "Input flagged by safety filter" }] }, { status: 400 }),
    );
    await expect(provider.edit(input())).rejects.toMatchObject({ code: "PROVIDER_REFUSED" });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({ errors: [{ message: "boom" }] }, { status: 500 }),
    );
    await expect(provider.edit(input())).rejects.toMatchObject({ code: "PROVIDER_ERROR" });
  });

  it("reports an abort as a timeout", async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      controller.abort();
      return Promise.reject(new DOMException("aborted", "AbortError"));
    });
    await expect(provider.edit(input(controller.signal))).rejects.toBeInstanceOf(ProviderError);
    await expect(provider.edit(input(controller.signal))).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
  });

  it("keeps the aspect ratio within 1536 px on 16 px steps", () => {
    expect(fluxSize(1536, 1024)).toEqual({ width: 1536, height: 1024 });
    expect(fluxSize(4032, 3024)).toEqual({ width: 1536, height: 1152 });
    expect(fluxSize(1080, 1920)).toEqual({ width: 864, height: 1536 });
  });
});

describe("mock provider", () => {
  it("returns the style's example after a delay and can be cancelled", async () => {
    vi.useFakeTimers();
    const pending = mockProvider.edit(input());
    await vi.advanceTimersByTimeAsync(1500);
    const out = await pending;
    expect(out.kind).toBe("example");
    expect(out.image[0]).toBe(0xff); // the bundled JPEG

    const controller = new AbortController();
    const cancelled = mockProvider.edit(input(controller.signal));
    controller.abort();
    await expect(cancelled).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
    vi.useRealTimers();
  });
});

describe("daily cap window", () => {
  it("counts per UTC day (Cloudflare resets at 00:00 UTC)", async () => {
    expect(utcDayStart(new Date("2030-03-16T06:30:00Z")).toISOString()).toBe("2030-03-16T00:00:00.000Z");
    const day1 = new Date("2030-03-16T10:00:00Z");
    bumpMemoryCount(day1);
    bumpMemoryCount(day1);
    expect(await liveRendersToday("cloudflare", false, day1)).toBe(2);
    expect(await liveRendersToday("cloudflare", false, new Date("2030-03-17T00:00:01Z"))).toBe(0);
  });
});
