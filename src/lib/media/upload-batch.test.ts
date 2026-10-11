import { describe, expect, it } from "vitest";
import { altFromFileName, checkImageFile, roomFor } from "@/lib/media/upload-batch";

describe("checkImageFile", () => {
  it("accepts the four image types up to 4 MB", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp", "image/avif"]) expect(checkImageFile({ name: "a", size: 1000, type }).ok).toBe(true);
    expect(checkImageFile({ name: "a.jpg", size: 4 * 1024 * 1024, type: "image/jpeg" }).ok).toBe(true);
  });
  it("rejects other types, empty files and files over 4 MB with a reason", () => {
    expect(checkImageFile({ name: "a.gif", size: 10, type: "image/gif" })).toMatchObject({ ok: false });
    expect(checkImageFile({ name: "a.pdf", size: 10, type: "application/pdf" })).toMatchObject({ ok: false });
    expect(checkImageFile({ name: "a.jpg", size: 0, type: "image/jpeg" })).toMatchObject({ ok: false, error: "This file is empty" });
    const big = checkImageFile({ name: "a.jpg", size: 6 * 1024 * 1024, type: "image/jpeg" });
    expect(big).toMatchObject({ ok: false });
    expect(big.ok === false && big.error).toContain("6.0 MB");
  });
});

describe("altFromFileName", () => {
  it("turns a file name into a readable starting point", () => {
    expect(altFromFileName("server-hall_01.jpg")).toBe("Server hall 01");
    expect(altFromFileName("IMG  2041.PNG")).toBe("IMG 2041");
    expect(altFromFileName("solar.panel.field.webp")).toBe("Solar.panel.field");
    expect(altFromFileName(".jpg")).toBe("");
  });
});

describe("roomFor", () => {
  it("counts how many more files fit", () => {
    expect(roomFor(0)).toBe(20);
    expect(roomFor(15)).toBe(5);
    expect(roomFor(25)).toBe(0);
  });
});
