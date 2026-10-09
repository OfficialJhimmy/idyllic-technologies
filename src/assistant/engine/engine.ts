import { compareProducts } from "@/assistant/comparisons";
import { LIMITS, categoriesFor, nextQuestionId } from "@/assistant/flows";
import { questions, optionLabel } from "@/assistant/questions";
import { handoffsFor, recommend } from "@/assistant/recommendations";
import { AUDIENCES, LOAD_BANDS, NEEDS, type AssistantEngine, type AssistantInput, type AssistantState, type CatalogueSource, type QuestionId, type Turn } from "@/assistant/engine/types";

const valid: Record<QuestionId, readonly string[]> = { audience: AUDIENCES, need: NEEDS, load: LOAD_BANDS };

/** Answers after the one being changed are dropped, so changing an early answer cannot leave a stale later one. */
function withAnswer(state: AssistantState, questionId: QuestionId, optionId: string): AssistantState | null {
  if (!valid[questionId].includes(optionId) || optionLabel(questionId, optionId) === null) return null;
  const order: QuestionId[] = ["audience", "need", "load"];
  const kept = Object.fromEntries(order.slice(0, order.indexOf(questionId)).flatMap((id) => (state.answers[id] ? [[id, state.answers[id]]] : [])));
  return { answers: { ...kept, [questionId]: optionId } };
}

/**
 * The deterministic engine: fixed questions, rules over fields that exist, no model and no guessing.
 * It reads products through a CatalogueSource, which only ever returns published products.
 */
export function createDeterministicEngine(source: CatalogueSource): AssistantEngine {
  async function recommendation(state: AssistantState): Promise<Turn> {
    const need = state.answers.need;
    if (!need) return question(state, "audience");
    const products = await source.productsInCategories([...categoriesFor(need)]);
    const { groups, notes } = recommend(products, state.answers);

    if (groups.length === 0) {
      return {
        kind: "handoff",
        state,
        headline: "I could not match a product to that yet. Some product details are missing, so a person can help.",
        notes,
        handoffs: handoffsFor([], []),
      };
    }
    const productIds = groups.flatMap((g) => g.products.map((p) => p.id));
    const count = productIds.length;
    return {
      kind: "recommendation",
      state,
      headline: count === 1 ? "I found 1 product that matches what you told me." : `I found ${count} products that match what you told me.`,
      groups,
      notes,
      handoffs: handoffsFor(productIds, groups.map((g) => g.marketplacePath)),
    };
  }

  function question(state: AssistantState, id: QuestionId): Turn {
    return { kind: "question", state, question: questions[id] };
  }

  return {
    async next(state, input: AssistantInput): Promise<Turn> {
      switch (input.type) {
        case "start":
          return question({ answers: {} }, "audience");

        case "answer": {
          const updated = withAnswer(state, input.questionId, input.optionId);
          if (!updated) return question(state, nextQuestionId(state.answers) ?? "audience");
          const next = nextQuestionId(updated.answers);
          return next ? question(updated, next) : recommendation(updated);
        }

        case "compare": {
          const ids = [...new Set(input.productIds)].slice(0, LIMITS.perCategory);
          const data = await source.compare(ids);
          const result = compareProducts(data);
          const count = data.products.length;
          return {
            kind: "comparison",
            state,
            headline: result.usable ? `Here is how these ${count} compare.` : "I could not build a comparison for those.",
            categoryName: data.categoryName ?? "",
            products: data.products.map(({ id, slug, name, brandName }) => ({ id, slug, name, brandName })),
            rows: result.rows,
            notes: result.notes,
            handoffs: handoffsFor(data.products.map((p) => p.id), []),
          };
        }

        case "handoff":
          return {
            kind: "handoff",
            state,
            headline: "Here are ways to reach a person. Your answers so far will go with your message.",
            notes: [],
            // A booking with no answers and no product would say nothing, so WhatsApp is offered once there is something to send.
            handoffs: handoffsFor([], [], { whatsapp: Object.keys(state.answers).length > 0 }),
          };
      }
    },
  };
}
