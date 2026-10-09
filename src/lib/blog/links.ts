/**
 * Turns what staff type in the link box into a safe address, or null if it is not one.
 * Web, email and phone links only. A bare domain gets https:// and a bare email gets mailto:.
 */
export function normaliseLinkUrl(input: string): string | null {
  const text = input.trim();
  if (!text) return null;

  if (/^https?:\/\//i.test(text)) {
    try {
      return new URL(text).href === "" ? null : text;
    } catch {
      return null;
    }
  }
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(text)) return text;
  if (/^tel:\+?[\d()-]{6,}$/i.test(text)) return text;
  if (/^[^\s@:/]+@[^\s@:/]+\.[^\s@:/]+$/.test(text)) return `mailto:${text}`;
  if (/^\+?[\d\s()-]{7,}$/.test(text)) return `tel:${text.replace(/[\s()-]/g, "")}`;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(text)) return `https://${text}`;
  return null;
}
