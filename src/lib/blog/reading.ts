/** Reading time from the stored HTML of a post. Pure, so it is tested. */

const WORDS_PER_MINUTE = 200;

export function countWords(html: string): number {
  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** At least one minute, rounded up. */
export function readingMinutes(html: string): number {
  return Math.max(1, Math.ceil(countWords(html) / WORDS_PER_MINUTE));
}

/** Minutes still to read at a given percentage, never below zero. */
export function minutesLeft(totalMinutes: number, percent: number): number {
  return Math.max(0, Math.ceil(totalMinutes * (1 - Math.min(100, Math.max(0, percent)) / 100)));
}
