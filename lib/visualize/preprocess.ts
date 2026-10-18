// FR-VIS-01/02: browser-side preparation. Decoding with imageOrientation "from-image" applies the EXIF
// rotation; drawing to a canvas and re-encoding drops every EXIF tag, including GPS.

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const MAX_EDGE_PX = 1536;
export const JPEG_QUALITY = 0.85;

export type PreparedPhoto = { blob: Blob; width: number; height: number; url: string };

export type PrepareError = "UNSUPPORTED" | "HEIC_UNSUPPORTED" | "TOO_LARGE" | "UNREADABLE";

export class PrepareFailure extends Error {
  constructor(readonly code: PrepareError) {
    super(code);
  }
}

const ACCEPTED = /^image\/(jpeg|png|webp|heic|heif)$/i;
const isHeic = (file: File) => /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

/** Pure: the target size for a photo, long edge capped at MAX_EDGE_PX. */
export function targetSize(width: number, height: number, maxEdge = MAX_EDGE_PX) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export function checkFile(file: File): PrepareError | null {
  if (!ACCEPTED.test(file.type) && !isHeic(file)) return "UNSUPPORTED";
  if (file.size > MAX_UPLOAD_BYTES) return "TOO_LARGE";
  return null;
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const problem = checkFile(file);
  if (problem) throw new PrepareFailure(problem);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Only Safari decodes HEIC; elsewhere ask for a JPEG instead of failing silently.
    throw new PrepareFailure(isHeic(file) ? "HEIC_UNSUPPORTED" : "UNREADABLE");
  }
  const { width, height } = targetSize(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new PrepareFailure("UNREADABLE");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new PrepareFailure("UNREADABLE");
  return { blob, width, height, url: URL.createObjectURL(blob) };
}

/** CONTENT §5 and §12 copy for each failure. */
export function prepareMessage(code: PrepareError): string {
  switch (code) {
    case "UNSUPPORTED":
      return "That file isn't a photo we can use. Try a JPEG, PNG or WebP.";
    case "HEIC_UNSUPPORTED":
      return 'This browser can\'t open HEIC photos. Change your camera to "Most Compatible" or upload a JPEG.';
    case "TOO_LARGE":
      return "That photo is over 12 MB. Try a smaller one.";
    case "UNREADABLE":
      return "We couldn't read that photo. Try another one.";
  }
}
