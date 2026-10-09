import type { Answers, AssistantProduct, Handoff, Need, SuggestionGroup } from "@/assistant/engine/types";
import { LIMITS, LOAD_FIELDS, categoriesFor } from "@/assistant/flows";
import { AUDIENCE_LABELS } from "@/assistant/questions";
import { evaluateProduct } from "@/assistant/rules";

export type Recommendation = { groups: SuggestionGroup[]; notes: string[] };

const byName = (a: AssistantProduct, b: AssistantProduct) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id);

/**
 * Picks products for an answered need. Only published products reach this function, and only fields with
 * values are used. Every product that is left out for lack of data is counted, so the notes can say what
 * the assistant could not check instead of quietly hiding it.
 */
export function recommend(products: AssistantProduct[], answers: Answers): Recommendation {
  const need: Need | undefined = answers.need;
  if (!need) return { groups: [], notes: [] };

  const notes: string[] = [];
  const audienceLabel = answers.audience ? AUDIENCE_LABELS[answers.audience] : null;
  const matched: { slug: string; name: string; items: { product: AssistantProduct; surplus: number; reasons: string[] }[] }[] = [];

  for (const slug of categoriesFor(need)) {
    const inCategory = products.filter((p) => p.categorySlug === slug).sort(byName);
    const name = inCategory[0]?.categoryName ?? slug;
    if (inCategory.length === 0) continue;

    const evaluated = inCategory.map((product) => ({ product, ev: evaluateProduct(product, answers) }));
    const untagged = evaluated.filter((e) => e.ev.audience === "unknown").length;
    const noRating = evaluated.filter((e) => e.ev.audience !== "unknown" && e.ev.load === "unknown").length;

    if (untagged > 0 && audienceLabel) {
      notes.push(`${untagged} ${name} ${untagged === 1 ? "product has" : "products have"} not been tagged for any use yet, so I cannot say whether ${untagged === 1 ? "it suits" : "they suit"} ${audienceLabel.toLowerCase()}. You can still see ${untagged === 1 ? "it" : "them"} in the marketplace.`);
    }
    if (noRating > 0) {
      notes.push(`${noRating} ${name} ${noRating === 1 ? "product does" : "products do"} not list a power rating, so I could not check ${noRating === 1 ? "it" : "them"} against your load.`);
    }
    const below = evaluated.filter((e) => e.ev.audience === "pass" && e.ev.load === "fail").length;
    if (below > 0) {
      notes.push(`${below} ${name} ${below === 1 ? "product suits" : "products suit"} ${audienceLabel?.toLowerCase() ?? "your use"} but ${below === 1 ? "is" : "are"} rated below your load, so I left ${below === 1 ? "it" : "them"} out.`);
    }
    if (answers.load && answers.load !== "not-sure" && !(slug in LOAD_FIELDS)) {
      notes.push(`Products in ${name} have no power rating to compare, so those suggestions are matched on use only, not on load.`);
    }

    const items = evaluated
      .filter((e) => e.ev.eligible)
      // Closest sufficient rating first, so a visitor is not pointed at the biggest unit by default.
      .sort((a, b) => a.ev.surplusWatts - b.ev.surplusWatts || byName(a.product, b.product))
      .map((e) => ({ product: e.product, surplus: e.ev.surplusWatts, reasons: e.ev.reasons }));
    if (items.length > 0) matched.push({ slug, name, items });
  }

  // Share the total between categories, never more than the per category limit.
  const share = matched.length === 0 ? 0 : Math.max(1, Math.min(LIMITS.perCategory, Math.floor(LIMITS.total / matched.length)));
  const groups: SuggestionGroup[] = matched.map((m) => ({
    categorySlug: m.slug,
    categoryName: m.name,
    marketplacePath: `/category/${m.slug}`,
    products: m.items.slice(0, share).map(({ product, reasons }) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brandName: product.brandName,
      image: product.image,
      reasons,
    })),
  }));

  return { groups, notes: [...new Set(notes)] };
}

/** The handoffs that always make sense: the marketplace, WhatsApp with the visitor's requirements (only when there is something to send), and the contact form. */
export function handoffsFor(productIds: string[], categoryPaths: string[], { whatsapp = true }: { whatsapp?: boolean } = {}): Handoff[] {
  const single = categoryPaths.length === 1 ? categoryPaths[0] : undefined;
  return [
    { target: "marketplace", label: single ? "Browse the category" : "Browse the marketplace", path: single ?? "/" },
    ...(whatsapp ? [{ target: "whatsapp", label: "Book on WhatsApp", productIds } as const] : []),
    { target: "contact", label: "Send a message instead" },
  ];
}
