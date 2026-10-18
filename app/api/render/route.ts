import { getDb } from "@/db/client";
import { renders } from "@/db/schema";
import { getImageProvider, ProviderError, type EditOutput, type ImageProvider } from "@/lib/ai";
import { bumpMemoryCount, liveRendersToday } from "@/lib/ai/daily-cap";
import { buildPrompt, getStyle } from "@/lib/ai/prompt";
import { galleryProvider } from "@/lib/ai/providers/gallery";
import { fail, logServerError, newRequestId, ok, type ErrorCode } from "@/lib/api-response";
import { serverEnv } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

// SRS §14 POST /api/render, FR-VIS-04/05/06/11/12/13/16.
// Privacy (AGENTS §2.4, FR-VIS-11): the photo exists only in this request's memory. It is forwarded to the
// provider and never written to disk, the database or logs; only metadata is stored.

export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024; // after client preprocessing (≤ 1536 px JPEG)
const SERVER_TIMEOUT_MS = 50_000; // FR-VIS-06
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

type RenderStatus = "success" | "failed" | "timeout" | "fallback" | "refused";

function isJpegPngOrWebp(b: Uint8Array): boolean {
  const jpeg = b[0] === 0xff && b[1] === 0xd8;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const webp = b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  return jpeg || png || webp;
}

export async function POST(req: Request) {
  const requestId = newRequestId();
  const env = serverEnv();

  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BYTES + 64 * 1024) return fail("PAYLOAD_TOO_LARGE", { requestId });

  const limit = await rateLimit(req, "render", { requestId });
  if (!limit.allowed) {
    return fail("RATE_LIMITED", { requestId, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("INVALID_IMAGE", { requestId });
  }
  const style = form.get("style");
  const file = form.get("image");
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  if (typeof style !== "string" || !getStyle(style)) return fail("INVALID_INPUT", { requestId });
  if (!(file instanceof Blob) || !ACCEPTED.has(file.type) || file.size === 0 || file.size > MAX_BYTES) {
    return fail("INVALID_IMAGE", { requestId });
  }
  const image = new Uint8Array(await file.arrayBuffer());
  // FR-VIS-13: trust the bytes, not the declared type.
  if (!isJpegPngOrWebp(image)) return fail("INVALID_IMAGE", { requestId });

  // ARCH §8 demo mode: the client sends x-demo: 1 for ?demo=1; only this route and notify honor it.
  let provider: ImageProvider = getImageProvider(env, { demo: req.headers.get("x-demo") === "1" });

  // RENDER_DAILY_CAP: past the cap, serve the gallery so free quota is never exceeded (ARCH §6).
  let capped = false;
  if (provider.live) {
    try {
      capped = (await liveRendersToday(provider.name, !env.MOCK_DB)) >= env.RENDER_DAILY_CAP;
    } catch (err) {
      logServerError(requestId, "render:cap", err);
      capped = true; // can't prove we're under the cap: don't spend quota
    }
    if (capped) provider = galleryProvider;
  }

  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);
  req.signal.addEventListener("abort", () => controller.abort()); // the visitor cancelled

  let output: EditOutput | null = null;
  let status: RenderStatus = "success";
  let errorCode: ErrorCode | null = null;
  try {
    output = await provider.edit({
      image,
      mime: "image/jpeg",
      width: Number.isFinite(width) && width > 0 ? width : 1536,
      height: Number.isFinite(height) && height > 0 ? height : 1024,
      prompt: buildPrompt(style),
      style,
      signal: controller.signal,
    });
    if (output.kind === "example") status = "fallback";
  } catch (err) {
    const code = err instanceof ProviderError ? err.code : "PROVIDER_ERROR";
    errorCode = code;
    status = code === "PROVIDER_TIMEOUT" ? "timeout" : code === "PROVIDER_REFUSED" ? "refused" : "failed";
    // Log the code and provider message only; never the image or prompt inputs.
    logServerError(requestId, `render:${provider.name}`, err);
  } finally {
    clearTimeout(timer);
  }
  const durationMs = Date.now() - t0;

  if (provider.live && env.MOCK_DB) bumpMemoryCount();
  const renderId = await recordRender({
    useDb: !env.MOCK_DB,
    style,
    provider: provider.name,
    status,
    durationMs,
    errorCode: capped ? "DAILY_CAP" : errorCode,
    requestId,
  });

  if (!output) return fail(errorCode ?? "PROVIDER_ERROR", { requestId });
  return ok({
    renderId,
    imageBase64: Buffer.from(output.image).toString("base64"),
    mime: output.mime,
    provider: provider.name,
    kind: output.kind,
    // Tells the UI which label to show: GALLERY → "for this style" (FR-VIS-05); anything else → "live preview unavailable" (FR-VIS-12).
    reason: capped
      ? "DAILY_CAP"
      : provider.name === "gallery"
        ? "GALLERY"
        : provider.name === "mock"
          ? "MOCK"
          : null,
    durationMs,
  });
}

async function recordRender(row: {
  useDb: boolean;
  style: string;
  provider: string;
  status: RenderStatus;
  durationMs: number;
  errorCode: string | null;
  requestId: string;
}): Promise<string> {
  if (!row.useDb) return crypto.randomUUID();
  try {
    const [inserted] = await getDb()
      .insert(renders)
      .values({
        style: row.style,
        provider: row.provider,
        status: row.status,
        durationMs: row.durationMs,
        errorCode: row.errorCode,
      })
      .returning({ id: renders.id });
    return inserted?.id ?? crypto.randomUUID();
  } catch (err) {
    // FR-VIS-16 metadata is best-effort; the visitor still gets their render.
    logServerError(row.requestId, "render:record", err);
    return crypto.randomUUID();
  }
}
