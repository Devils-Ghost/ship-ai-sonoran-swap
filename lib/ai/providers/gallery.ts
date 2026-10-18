import { readFile } from "node:fs/promises";
import path from "node:path";
import { getStyle } from "@/lib/ai/prompt";
import { ProviderError, type EditInput, type EditOutput, type ImageProvider } from "@/lib/ai/image-provider";

// FR-VIS-05/12: the $0 tier that always works. Returns the style's pre-rendered sample (public/samples).
export async function readSampleAfter(style: string): Promise<Uint8Array> {
  const sample = getStyle(style)?.sampleAfter;
  if (!sample) throw new ProviderError("PROVIDER_ERROR", `No sample for style "${style}"`);
  // sampleAfter is validated as "/samples/<name>.jpg"; resolve it under public/ only.
  const file = path.join(process.cwd(), "public", path.normalize(sample).replace(/^([/\\])+/, ""));
  return new Uint8Array(await readFile(file));
}

export const galleryProvider: ImageProvider = {
  name: "gallery",
  live: false,
  async edit(input: EditInput): Promise<EditOutput> {
    return { image: await readSampleAfter(input.style), mime: "image/jpeg", kind: "example" };
  },
};
