import { describe, expect, it } from "vitest";
import { normaliseLinkUrl } from "./links";

describe("normaliseLinkUrl", () => {
  it("keeps full web addresses", () => {
    expect(normaliseLinkUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(normaliseLinkUrl("  http://example.com ")).toBe("http://example.com");
  });
  it("adds https to a bare domain", () => {
    expect(normaliseLinkUrl("idyllictechnologies.com")).toBe("https://idyllictechnologies.com");
    expect(normaliseLinkUrl("www.example.com/path")).toBe("https://www.example.com/path");
  });
  it("turns an email into mailto and a number into tel", () => {
    expect(normaliseLinkUrl("info@idyllictechnologies.com")).toBe("mailto:info@idyllictechnologies.com");
    expect(normaliseLinkUrl("+234 703 797 3666")).toBe("tel:+2347037973666");
    expect(normaliseLinkUrl("tel:+2347037973666")).toBe("tel:+2347037973666");
  });
  it("refuses anything that could run code or is not an address", () => {
    for (const bad of ["", "   ", "javascript:alert(1)", "data:text/html,<script>1</script>", "vbscript:x", "just some words", "ftp://x.com", "//evil.test"]) {
      expect(normaliseLinkUrl(bad)).toBeNull();
    }
  });
});
