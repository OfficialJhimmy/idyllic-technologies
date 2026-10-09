import type { Answers, AssistantProduct } from "@/assistant/engine/types";
import { AUDIENCE_LABELS } from "@/assistant/questions";
import { HIGHLIGHT_SPECS, LOAD_FIELDS, LOAD_REQUIRED_WATTS } from "@/assistant/flows";

/**
 * Matching rules over fields that exist. A rule never guesses: when the field it needs is empty, it says
 * "unknown" and the product is left out and counted, so the assistant can be honest about it.
 */

export type RuleStatus = "pass" | "fail" | "unknown" | "not-applicable";

/** Tags are curated by staff. A product with no tags is unknown for every audience, not a match. */
export function checkAudience(product: AssistantProduct, audience: Answers["audience"]): { status: RuleStatus; reason?: string } {
  if (!audience) return { status: "not-applicable" };
  if (product.tags.length === 0) return { status: "unknown" };
  if (!product.tags.includes(audience)) return { status: "fail" };
  return { status: "pass", reason: `Tagged by Idyllic as suitable for: ${AUDIENCE_LABELS[audience]}` };
}

/** Compares the rating in watts with what the chosen band asks for. Only categories with a rating field can be checked. */
export function checkLoad(product: AssistantProduct, load: Answers["load"]): { status: RuleStatus; reason?: string; surplusWatts?: number } {
  if (!load || load === "not-sure") return { status: "not-applicable" };
  const field = LOAD_FIELDS[product.categorySlug];
  if (!field) return { status: "not-applicable" };
  const fact = product.specs[field.key];
  if (!fact || fact.numeric === null) return { status: "unknown" };
  const required = LOAD_REQUIRED_WATTS[load];
  if (fact.numeric < required) return { status: "fail" };
  return { status: "pass", reason: `${fact.label}: ${fact.display}, which covers a load of up to ${required.toLocaleString("en")} W`, surplusWatts: fact.numeric - required };
}

/** Real values worth showing next to a suggestion, such as voltage or phase. Nothing is added that is not stored. */
export function highlightFacts(product: AssistantProduct): string[] {
  return (HIGHLIGHT_SPECS[product.categorySlug] ?? []).flatMap((key) => {
    const fact = product.specs[key];
    return fact ? [`${fact.label}: ${fact.display}`] : [];
  });
}

export type Evaluation = {
  eligible: boolean;
  audience: RuleStatus;
  load: RuleStatus;
  reasons: string[];
  surplusWatts: number;
};

export function evaluateProduct(product: AssistantProduct, answers: Answers): Evaluation {
  const audience = checkAudience(product, answers.audience);
  const load = checkLoad(product, answers.load);
  const eligible = audience.status !== "fail" && audience.status !== "unknown" && load.status !== "fail" && load.status !== "unknown";
  const reasons = [audience.reason, load.reason, ...highlightFacts(product).filter((f) => !load.reason || !load.reason.startsWith(f))].filter((r): r is string => Boolean(r));
  return { eligible, audience: audience.status, load: load.status, reasons, surplusWatts: load.surplusWatts ?? 0 };
}
