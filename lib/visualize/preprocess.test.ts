import { describe, expect, it } from "vitest";
import { checkFile, prepareMessage, targetSize } from "./preprocess";

const file = (name: string, type: string, size = 1000) => new File([new Uint8Array(size)], name, { type });

describe("photo preprocessing (FR-VIS-01/02)", () => {
  it("caps the long edge at 1536 px and never upscales", () => {
    expect(targetSize(4032, 3024)).toEqual({ width: 1536, height: 1152 });
    expect(targetSize(3024, 4032)).toEqual({ width: 1152, height: 1536 });
    expect(targetSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("accepts photos, HEIC included, and rejects everything else", () => {
    expect(checkFile(file("a.jpg", "image/jpeg"))).toBeNull();
    expect(checkFile(file("a.png", "image/png"))).toBeNull();
    expect(checkFile(file("a.webp", "image/webp"))).toBeNull();
    expect(checkFile(file("IMG_0001.HEIC", ""))).toBeNull();
    expect(checkFile(file("a.pdf", "application/pdf"))).toBe("UNSUPPORTED");
    expect(checkFile(file("a.gif", "image/gif"))).toBe("UNSUPPORTED");
  });

  it("rejects files over 12 MB before decoding", () => {
    expect(checkFile(file("big.jpg", "image/jpeg", 12 * 1024 * 1024 + 1))).toBe("TOO_LARGE");
  });

  it("has a plain message for every failure", () => {
    for (const code of ["UNSUPPORTED", "HEIC_UNSUPPORTED", "TOO_LARGE", "UNREADABLE"] as const) {
      expect(prepareMessage(code).length).toBeGreaterThan(10);
    }
  });
});
