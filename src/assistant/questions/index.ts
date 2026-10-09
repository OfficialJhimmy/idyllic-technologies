import type { Audience, LoadBand, Need, Question, QuestionId } from "@/assistant/engine/types";

/**
 * The words the assistant uses. This copy was written for the assistant and is not Idyllic's approved
 * copy, so it needs their review (see design/decisions.md). Option ids are stable; labels can change.
 */

export const AUDIENCE_LABELS: Record<Audience, string> = {
  home: "Home",
  office: "Office",
  business: "Business",
  industrial: "Industrial equipment",
};

export const NEED_LABELS: Record<Need, string> = {
  backup: "Keep things running during power cuts",
  solar: "Run on solar",
  it: "Protect IT equipment",
  distribution: "Distribute power around a building",
};

export const LOAD_LABELS: Record<LoadBand, string> = {
  "up-to-1kw": "Up to 1 kW",
  "1-3kw": "1 to 3 kW",
  "3-10kw": "3 to 10 kW",
  "over-10kw": "More than 10 kW",
  "not-sure": "I am not sure",
};

const toOptions = <T extends string>(labels: Record<T, string>) => (Object.keys(labels) as T[]).map((id) => ({ id, label: labels[id] }));

export const questions: Record<QuestionId, Question> = {
  audience: {
    id: "audience",
    prompt: "What are you looking to power?",
    intro: "I will ask a few questions, then suggest products from the marketplace using the details Idyllic has entered for each one.",
    options: toOptions(AUDIENCE_LABELS),
  },
  need: {
    id: "need",
    prompt: "What do you need it to do?",
    options: toOptions(NEED_LABELS),
  },
  load: {
    id: "load",
    prompt: "Roughly how much power does it need to carry?",
    hint: "A rough figure is fine.",
    options: toOptions(LOAD_LABELS),
  },
};

export function optionLabel(questionId: QuestionId, optionId: string): string | null {
  return questions[questionId].options.find((o) => o.id === optionId)?.label ?? null;
}
