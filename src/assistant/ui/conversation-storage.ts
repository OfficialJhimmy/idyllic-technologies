/**
 * Keeps the conversation when the page is refreshed, for as long as the tab stays open. Only what was said and
 * chosen is kept (answers and the suggested products), and it is dropped after twelve hours. Pure helpers, so they are tested.
 */

export const STORAGE_KEY = "idyllic.assistant.v1";
export const MAX_AGE_MS = 12 * 60 * 60 * 1000;

export type StoredEntry = { id: number; kind: "greeting" | "user" | "turn"; [key: string]: unknown };

export type Stored = { at: number; entries: StoredEntry[] };

const TURN_KINDS = ["question", "recommendation", "comparison", "handoff"];

/** Greeting for the visitor's own clock: morning until noon, afternoon until 5 pm, then evening. */
export function greetingFor(hour: number): string {
  const part = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return `Good ${part}, and welcome to Idyllic Technologies.`;
}

/** Returns the saved entries if they look right and are recent, otherwise null. Nothing from storage is trusted blindly. */
export function parseStored(raw: string | null, now: number = Date.now()): StoredEntry[] | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<Stored>;
    if (typeof data.at !== "number" || now - data.at > MAX_AGE_MS || !Array.isArray(data.entries) || data.entries.length === 0 || data.entries.length > 80) return null;
    for (const e of data.entries) {
      if (!e || typeof e !== "object" || typeof e.id !== "number") return null;
      if (e.kind === "user" || e.kind === "greeting") {
        if (typeof e.text !== "string") return null;
      } else if (e.kind === "turn") {
        const turn = e.turn as { kind?: unknown; state?: unknown } | undefined;
        if (!turn || typeof turn.kind !== "string" || !TURN_KINDS.includes(turn.kind) || !turn.state || typeof turn.state !== "object") return null;
      } else return null;
    }
    return data.entries;
  } catch {
    return null;
  }
}

export const serialize = (entries: StoredEntry[], now: number = Date.now()): string => JSON.stringify({ at: now, entries } satisfies Stored);
