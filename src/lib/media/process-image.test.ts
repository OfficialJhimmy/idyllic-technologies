import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { ImageRejected, MAX_EDGE_PX, MAX_UPLOAD_BYTES, processImage, validatePdf } from "./process-image";

const png = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 62, b: 157, alpha: 1 } } }).png().toBuffer();

describe("processImage", () => {
  it("converts to WebP and reports real dimensions and size", async () => {
    const out = await processImage(await png(800, 600));
    const meta = await sharp(out.buffer).metadata();
    expect(meta.format).toBe("webp");
    expect([out.width, out.height]).toEqual([800, 600]);
    expect(out.bytes).toBe(out.buffer.length);
  });

  it("caps the longest edge and keeps the aspect ratio", async () => {
    const out = await processImage(await png(3000, 1500));
    expect(out.width).toBe(MAX_EDGE_PX);
    expect(out.height).toBe(1000);
  });

  it("never enlarges small images", async () => {
    const out = await processImage(await png(120, 80));
    expect([out.width, out.height]).toEqual([120, 80]);
  });

  it("keeps transparency for cut out product photos", async () => {
    const cutout = await sharp({ create: { width: 50, height: 50, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
    const out = await processImage(cutout);
    expect((await sharp(out.buffer).metadata()).hasAlpha).toBe(true);
  });

  it("rejects SVG even when it is named like an image", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>');
    await expect(processImage(svg)).rejects.toBeInstanceOf(ImageRejected);
  });

  it("rejects GIF, plain text, empty and oversized files", async () => {
    const gif = await sharp({ create: { width: 4, height: 4, channels: 3, background: "#fff" } }).gif().toBuffer();
    await expect(processImage(gif)).rejects.toThrow(/JPEG, PNG, WebP or AVIF/);
    await expect(processImage(Buffer.from("not an image"))).rejects.toThrow(/not an image/);
    await expect(processImage(Buffer.alloc(0))).rejects.toThrow(/empty/);
    await expect(processImage(Buffer.alloc(MAX_UPLOAD_BYTES + 1))).rejects.toThrow(/4 MB/);
  });
});

describe("validatePdf", () => {
  it("accepts a PDF by its first bytes", () => {
    expect(() => validatePdf(Buffer.from("%PDF-1.7\n..."))).not.toThrow();
  });
  it("rejects a renamed non PDF", () => {
    expect(() => validatePdf(Buffer.from("<html></html>"))).toThrow(/not a PDF/);
  });
});
