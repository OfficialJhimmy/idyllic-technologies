import sanitizeHtml from "sanitize-html";

/**
 * Post bodies are stored as HTML written in the rich text editor. Everything is cleaned here before
 * it is saved, and the public pages must render only this cleaned HTML. Only formatting the editor can
 * produce is allowed: no scripts, styles, classes, forms, iframes or event handlers. Images must come
 * from our own media bucket, and links must be web, email or phone links.
 */
const ALLOWED_TAGS = ["p", "br", "h2", "h3", "h4", "strong", "em", "u", "a", "ul", "ol", "li", "blockquote", "hr", "img"];

export function sanitizePostHtml(html: string, opts: { mediaBaseUrl: string }): string {
  const mediaBase = opts.mediaBaseUrl.replace(/\/$/, "");
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    // Pasted headings or markup the editor cannot produce are flattened to what it can.
    transformTags: {
      h1: "h2",
      b: "strong",
      i: "em",
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "");
        return { tagName, attribs: { ...attribs, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : { target: "", rel: "" }) } };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "img" && !(frame.attribs.src ?? "").startsWith(`${mediaBase}/`),
  }).replace(/ (target|rel)=""/g, "");
}

/** True when a body has no words and no image or divider, such as the editor's empty "<p></p>". */
export function isBodyEmpty(html: string): boolean {
  if (/<(img|hr)\b/i.test(html)) return false;
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ").trim();
  return text.length === 0;
}
