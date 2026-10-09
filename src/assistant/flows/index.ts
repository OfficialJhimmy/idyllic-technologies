import type { Answers, LoadBand, Need, QuestionId } from "@/assistant/engine/types";
import { AUDIENCE_LABELS, LOAD_LABELS, NEED_LABELS } from "@/assistant/questions";

/**
 * The flow as typed config. Each need points at the product categories that serve it, in the order they
 * are shown. These pairings are Idyllic's to confirm (see design/decisions.md). Category slugs are the
 * six fixed categories.
 */
export const NEED_CATEGORIES: Record<Need, readonly string[]> = {
  backup: ["ups", "inverters", "full-river-battery"],
  solar: ["solar-panel", "inverters", "full-river-battery"],
  it: ["ups"],
  distribution: ["distribution-board", "sockets"],
};

/**
 * The spec field that holds a power rating in watts, per category. A load can only be checked where a
 * category has one. Inverters, batteries and the rest have no such field yet, so they are matched on
 * the other answers and the assistant says so.
 */
export const LOAD_FIELDS: Record<string, { key: string }> = {
  ups: { key: "rating_w" },
};

/** The most a load band asks of a product, in watts. "More than 10 kW" asks for at least 10 kW. */
export const LOAD_REQUIRED_WATTS: Record<Exclude<LoadBand, "not-sure">, number> = {
  "up-to-1kw": 1000,
  "1-3kw": 3000,
  "3-10kw": 10000,
  "over-10kw": 10000,
};

/** Spec fields shown as facts on a suggestion, per category, in this order. Only those with a value appear. */
export const HIGHLIGHT_SPECS: Record<string, readonly string[]> = {
  ups: ["rating_w", "rating_va", "topology"],
  inverters: ["phase", "voltage_class"],
  "full-river-battery": ["voltage", "capacity_20h"],
};

export const LIMITS = { perCategory: 3, total: 6 } as const;

export const categoriesFor = (need: Need): readonly string[] => NEED_CATEGORIES[need];
export const loadCanBeChecked = (need: Need): boolean => categoriesFor(need).some((c) => c in LOAD_FIELDS);

type Step = { id: QuestionId; applies: (answers: Answers) => boolean };

const steps: readonly Step[] = [
  { id: "audience", applies: () => true },
  { id: "need", applies: () => true },
  // Asked only when at least one category for this need lists a power rating. Asking would otherwise be pointless.
  { id: "load", applies: (a) => (a.need ? loadCanBeChecked(a.need) : false) },
];

/** The next question to ask, or null when everything that can be useful has been asked. */
export function nextQuestionId(answers: Answers): QuestionId | null {
  for (const step of steps) {
    if (step.applies(answers) && answers[step.id] === undefined) return step.id;
  }
  return null;
}

/** A plain sentence of what the visitor told us. Built from ids, never from typed text, so it is safe to send to staff. */
export function summarizeAnswers(answers: Answers): string {
  const parts: string[] = [];
  if (answers.audience) parts.push(`Looking to power: ${AUDIENCE_LABELS[answers.audience]}.`);
  if (answers.need) parts.push(`Need: ${NEED_LABELS[answers.need]}.`);
  if (answers.load) parts.push(`Approximate load: ${LOAD_LABELS[answers.load]}.`);
  return parts.join(" ");
}
