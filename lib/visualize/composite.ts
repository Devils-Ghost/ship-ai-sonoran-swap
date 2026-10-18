// FR-VIS-14: side-by-side before/after PNG (1600 × 900) with labels, the AI label and the site name.
// Canvas only; nothing is uploaded. Colors are read from the CSS tokens.

const W = 1600;
const H = 900;
const PAD = 32;
const GAP = 16;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

async function load(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  return img;
}

/** Draw `img` to cover the box, cropping the overflow (like object-fit: cover). */
function cover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

export async function composeBeforeAfter(opts: {
  beforeSrc: string;
  afterSrc: string;
  styleName: string;
  aiLabel: string;
  siteName: string;
}): Promise<Blob> {
  const [before, after] = await Promise.all([load(opts.beforeSrc), load(opts.afterSrc)]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  const caliche = cssVar("--color-caliche");
  const ink = cssVar("--color-ink");
  const saguaro = cssVar("--color-saguaro");
  const font = getComputedStyle(document.body).fontFamily;

  ctx.fillStyle = caliche;
  ctx.fillRect(0, 0, W, H);

  const imgW = (W - PAD * 2 - GAP) / 2;
  const imgH = (imgW * 2) / 3;
  const top = 96;
  cover(ctx, before, PAD, top, imgW, imgH);
  cover(ctx, after, PAD + imgW + GAP, top, imgW, imgH);

  ctx.fillStyle = saguaro;
  ctx.font = `600 36px ${font}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Before", PAD, top - 28);
  ctx.fillText(`After: ${opts.styleName}`, PAD + imgW + GAP, top - 28);

  ctx.fillStyle = ink;
  ctx.font = `500 26px ${font}`;
  ctx.fillText(opts.aiLabel, PAD, H - 48);
  ctx.textAlign = "right";
  ctx.fillText(opts.siteName, W - PAD, H - 48);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("export failed");
  return blob;
}
