import type { ServerEnv } from "@/lib/env";
import type { ImageProvider } from "./image-provider";
import { cloudflareProvider } from "./providers/cloudflare";
import { galleryProvider } from "./providers/gallery";
import { mockProvider } from "./providers/mock";

/**
 * FR-VIS-05 provider selection. MOCK_IMAGE_PROVIDER or a demo request forces the mock.
 * "gemini" stays a valid setting but maps to the gallery: its free tier has no image quota.
 */
export function getImageProvider(env: ServerEnv, options: { demo?: boolean } = {}): ImageProvider {
  if (env.MOCK_IMAGE_PROVIDER || options.demo) return mockProvider;
  if (
    env.IMAGE_PROVIDER === "cloudflare" &&
    env.CLOUDFLARE_ACCOUNT_ID &&
    env.CLOUDFLARE_API_TOKEN &&
    env.IMAGE_MODEL
  ) {
    return cloudflareProvider({
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: env.CLOUDFLARE_API_TOKEN,
      model: env.IMAGE_MODEL,
    });
  }
  if (env.IMAGE_PROVIDER === "mock") return mockProvider;
  return galleryProvider;
}

export { ProviderError } from "./image-provider";
export type { EditOutput, ImageProvider, ProviderErrorCode } from "./image-provider";
