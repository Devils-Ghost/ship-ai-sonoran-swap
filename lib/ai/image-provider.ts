// ARCH §6 provider adapter. Every provider maps its failures to one of three codes so the route
// and the UI never depend on a vendor's error shapes.

export type ProviderErrorCode = "PROVIDER_REFUSED" | "PROVIDER_TIMEOUT" | "PROVIDER_ERROR";

export class ProviderError extends Error {
  constructor(
    readonly code: ProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export type EditInput = {
  image: Uint8Array;
  mime: "image/jpeg";
  width: number;
  height: number;
  prompt: string;
  style: string;
  signal: AbortSignal;
};

export type EditOutput = {
  image: Uint8Array;
  mime: string;
  /**
   * "live": the visitor's own photo was edited. "example": a pre-rendered sample for the style
   * (FR-VIS-05 gallery mode, FR-VIS-12 fallback); the UI must never present it as their yard.
   */
  kind: "live" | "example";
};

export interface ImageProvider {
  /** Stored in renders.provider. */
  readonly name: "cloudflare" | "gallery" | "mock";
  /** Live providers spend free quota and count toward RENDER_DAILY_CAP. */
  readonly live: boolean;
  edit(input: EditInput): Promise<EditOutput>;
}
