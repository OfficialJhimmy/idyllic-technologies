import { describe, expect, it } from "vitest";
import { isBodyEmpty, sanitizePostHtml } from "./sanitize";

const media = "https://abc.supabase.co/storage/v1/object/public/media";
const clean = (html: string) => sanitizePostHtml(html, { mediaBaseUrl: media });

describe("sanitizePostHtml", () => {
  it("keeps the formatting the editor produces", () => {
    const html = '<h2>Title</h2><p>Some <strong>bold</strong>, <em>italic</em> and <u>underlined</u> text.</p><ul><li>One</li></ul><ol><li>Two</li></ol><blockquote><p>Quote</p></blockquote><hr>';
    expect(clean(html)).toBe('<h2>Title</h2><p>Some <strong>bold</strong>, <em>italic</em> and <u>underlined</u> text.</p><ul><li>One</li></ul><ol><li>Two</li></ol><blockquote><p>Quote</p></blockquote><hr />');
  });

  it("removes scripts, event handlers, styles, classes and iframes", () => {
    const out = clean('<p class="x" style="color:red" onclick="alert(1)">Hi</p><script>alert(1)</script><iframe src="https://evil.test"></iframe><img src="x" onerror="alert(1)">');
    expect(out).toBe("<p>Hi</p>");
  });

  it("refuses javascript and data links but keeps web, mail and phone links", () => {
    expect(clean('<a href="javascript:alert(1)">x</a>')).not.toContain("javascript");
    expect(clean('<a href="data:text/html,<script>1</script>">x</a>')).not.toContain("data:");
    expect(clean('<a href="https://example.com">x</a>')).toContain('href="https://example.com"');
    expect(clean('<a href="mailto:info@example.com">x</a>')).toContain("mailto:info@example.com");
    expect(clean('<a href="tel:+2347000000000">x</a>')).toContain("tel:+2347000000000");
  });

  it("opens external links in a new tab safely, and leaves other links alone", () => {
    expect(clean('<a href="https://example.com">x</a>')).toContain('target="_blank"');
    expect(clean('<a href="https://example.com">x</a>')).toContain('rel="noopener noreferrer"');
    const mail = clean('<a href="mailto:a@b.co">x</a>');
    expect(mail).not.toContain("target");
    expect(mail).not.toContain("rel=");
  });

  it("only allows images from our own media bucket, and keeps alt and size", () => {
    const ok = clean(`<img src="${media}/images/2026/10/a.webp" alt="A panel" width="800" height="600">`);
    expect(ok).toContain('alt="A panel"');
    expect(ok).toContain('width="800"');
    expect(clean('<img src="https://tracker.test/pixel.gif" alt="x">')).toBe("");
    expect(clean('<img src="data:image/png;base64,AAAA" alt="x">')).toBe("");
    expect(clean(`<img src="${media}.evil.test/a.webp" alt="x">`)).toBe("");
  });

  it("flattens markup the editor cannot produce", () => {
    expect(clean("<h1>Big</h1>")).toBe("<h2>Big</h2>");
    expect(clean("<p><b>x</b> <i>y</i></p>")).toBe("<p><strong>x</strong> <em>y</em></p>");
    expect(clean("<table><tr><td>cell</td></tr></table>")).not.toContain("<table");
  });
});

describe("isBodyEmpty", () => {
  it("treats the empty editor and whitespace as empty", () => {
    for (const html of ["", "<p></p>", "<p> </p>", "<p>&nbsp;</p><p><br></p>", "  "]) expect(isBodyEmpty(html)).toBe(true);
  });
  it("counts words, images and dividers as content", () => {
    expect(isBodyEmpty("<p>Hello</p>")).toBe(false);
    expect(isBodyEmpty('<p><img src="x" alt="a"></p>')).toBe(false);
    expect(isBodyEmpty("<hr>")).toBe(false);
  });
});
