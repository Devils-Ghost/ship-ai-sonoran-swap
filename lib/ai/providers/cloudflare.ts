import { ProviderError, type EditInput, type EditOutput, type ImageProvider } from "@/lib/ai/image-provider";

// Cloudflare Workers AI, free daily allocation (@cf/black-forest-labs/flux-2-klein-4b).
// FLUX.2 takes multipart fields prompt, width, height and input_image_0 (the photo to edit) and answers
// { result: { image: <base64 JPEG> } }. Field names were confirmed by testing; the docs don't list them.

/** FLUX.2 works in 16 px multiples; keep the visitor's aspect ratio. */
export function fluxSize(width: number, height: number, maxEdge = 1536): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const snap = (n: number) => Math.max(256, Math.round((n * scale) / 16) * 16);
  return { width: snap(width), height: snap(height) };
}

// Cloudflare reports safety refusals in the error message; anything else is a provider error.
const REFUSAL = /nsfw|safety|flagged|content policy|not allowed|moderation/i;

export function cloudflareProvider(config: {
  accountId: string;
  apiToken: string;
  model: string;
}): ImageProvider {
  return {
    name: "cloudflare",
    live: true,
    async edit(input: EditInput): Promise<EditOutput> {
      const size = fluxSize(input.width, input.height);
      const form = new FormData();
      form.append("prompt", input.prompt);
      form.append("width", String(size.width));
      form.append("height", String(size.height));
      form.append("input_image_0", new Blob([input.image as BlobPart], { type: input.mime }), "yard.jpg");

      let res: Response;
      try {
        res = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run/${config.model}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${config.apiToken}` },
            body: form,
            signal: input.signal,
          },
        );
      } catch (err) {
        if (input.signal.aborted) throw new ProviderError("PROVIDER_TIMEOUT", "aborted");
        throw new ProviderError("PROVIDER_ERROR", err instanceof Error ? err.message : "fetch failed");
      }

      const json = (await res.json().catch(() => null)) as {
        result?: { image?: string };
        errors?: { code?: number; message?: string }[];
      } | null;
      const message = json?.errors?.map((e) => `${e.code ?? ""} ${e.message ?? ""}`).join("; ") ?? "";
      if (!res.ok || !json?.result?.image) {
        if (REFUSAL.test(message)) throw new ProviderError("PROVIDER_REFUSED", message);
        throw new ProviderError("PROVIDER_ERROR", `HTTP ${res.status} ${message}`.trim());
      }
      return {
        image: Uint8Array.from(Buffer.from(json.result.image, "base64")),
        mime: "image/jpeg",
        kind: "live",
      };
    },
  };
}
