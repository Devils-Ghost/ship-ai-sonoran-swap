import { readSampleAfter } from "./gallery";
import { ProviderError, type EditInput, type EditOutput, type ImageProvider } from "@/lib/ai/image-provider";

// ARCH §6: tests and ?demo=1. Behaves like a live provider (delay, abort) without the network.
export const MOCK_DELAY_MS = 1500;

export const mockProvider: ImageProvider = {
  name: "mock",
  live: false,
  async edit(input: EditInput): Promise<EditOutput> {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, MOCK_DELAY_MS);
      input.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new ProviderError("PROVIDER_TIMEOUT", "aborted"));
      });
    });
    return { image: await readSampleAfter(input.style), mime: "image/jpeg", kind: "example" };
  },
};
