import type { z } from "zod";

// SRS §14: every route answers { ok: true, data } or { ok: false, error: { code, message } }.

export const ERRORS = {
  INVALID_INPUT: { status: 400, message: "Some of that information isn't valid. Check it and try again." },
  INVALID_IMAGE: { status: 400, message: "We couldn't read that photo. Try a JPEG or PNG under 4 MB." },
  NOT_FOUND: { status: 404, message: "We couldn't find that." },
  SLOT_UNAVAILABLE: { status: 409, message: "That time was just taken. Pick another." },
  PAYLOAD_TOO_LARGE: { status: 413, message: "That request is too large." },
  PROVIDER_REFUSED: { status: 422, message: "We couldn't process that photo. Try a photo of a yard." },
  RATE_LIMITED: { status: 429, message: "You're moving fast. Try again in a minute." },
  DAILY_CAP: { status: 429, message: "Live previews are resting for today. Here's an example instead." },
  INTERNAL: { status: 500, message: "Something went wrong on our side. Try again in a moment." },
  PROVIDER_ERROR: { status: 502, message: "Something went wrong on our side. Try again in a moment." },
  PROVIDER_TIMEOUT: {
    status: 504,
    message: "Taking longer than usual. Keep waiting, or see an example instead.",
  },
} as const;

export type ErrorCode = keyof typeof ERRORS;

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; error: { code: ErrorCode; message: string; requestId?: string } };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ ok: true, data } satisfies ApiSuccess<T>, init);
}

export function fail(code: ErrorCode, options: { requestId?: string; headers?: HeadersInit } = {}): Response {
  const { status, message } = ERRORS[code];
  const body: ApiFailure = { ok: false, error: { code, message, requestId: options.requestId } };
  return Response.json(body, { status, headers: options.headers });
}

export function newRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

/** Logs a server error with its request ID. Only the error's name and message: never bodies or headers. */
export function logServerError(requestId: string, route: string, err: unknown): void {
  const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  console.error(`[${requestId}] ${route} ${detail}`);
}

export const DEFAULT_BODY_LIMIT = 32 * 1024; // ARCH §9: 32 KB for JSON routes

/**
 * Reads and validates a JSON body without trusting Content-Length alone.
 * Returns the parsed data, or a ready-to-send error Response.
 */
export async function readJson<S extends z.ZodType>(
  req: Request,
  schema: S,
  maxBytes = DEFAULT_BODY_LIMIT,
): Promise<{ data: z.infer<S> } | { error: Response }> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return { error: fail("PAYLOAD_TOO_LARGE") };

  const text = await req.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) return { error: fail("PAYLOAD_TOO_LARGE") };

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { error: fail("INVALID_INPUT") };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { error: fail("INVALID_INPUT") };
  return { data: parsed.data };
}
