/**
 * The contract between the assistant's brain and its screen. The UI only ever sees AssistantEngine, Turn
 * and the other types in this file, so an engine that uses a language model could replace the
 * deterministic one later without touching the UI.
 */

export const AUDIENCES = ["home", "office", "business", "industrial"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const NEEDS = ["backup", "solar", "it", "distribution"] as const;
export type Need = (typeof NEEDS)[number];

export const LOAD_BANDS = ["up-to-1kw", "1-3kw", "3-10kw", "over-10kw", "not-sure"] as const;
export type LoadBand = (typeof LOAD_BANDS)[number];

export type Answers = { audience?: Audience; need?: Need; load?: LoadBand };
export type QuestionId = keyof Answers;

/** Everything the engine needs to continue a conversation. It is sent back by the browser, so it is validated on the server. */
export type AssistantState = { answers: Answers };
export const initialState: AssistantState = { answers: {} };

export type AssistantInput =
  | { type: "start" }
  | { type: "answer"; questionId: QuestionId; optionId: string }
  | { type: "compare"; productIds: string[] }
  | { type: "handoff" };

export type ProductImage = { storagePath: string; alt: string; width: number; height: number };

/** One suggested product. Every reason is built from a value Idyllic entered for this product. */
export type Suggestion = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  image: ProductImage | null;
  reasons: string[];
};

export type SuggestionGroup = { categorySlug: string; categoryName: string; products: Suggestion[]; marketplacePath: string };

export type Handoff =
  | { target: "marketplace"; label: string; path: string }
  | { target: "whatsapp"; label: string; productIds: string[] }
  | { target: "contact"; label: string };

export type QuestionOption = { id: string; label: string };
export type Question = { id: QuestionId; prompt: string; intro?: string; hint?: string; options: QuestionOption[] };

export type ComparisonTurnRow = { id: string; label: string; values: string[]; differs: boolean };

export type Turn =
  | { kind: "question"; state: AssistantState; question: Question }
  | { kind: "recommendation"; state: AssistantState; headline: string; groups: SuggestionGroup[]; notes: string[]; handoffs: Handoff[] }
  | { kind: "comparison"; state: AssistantState; headline: string; categoryName: string; products: { id: string; slug: string; name: string; brandName: string }[]; rows: ComparisonTurnRow[]; notes: string[]; handoffs: Handoff[] }
  | { kind: "handoff"; state: AssistantState; headline: string; notes: string[]; handoffs: Handoff[] };

export interface AssistantEngine {
  next(state: AssistantState, input: AssistantInput): Promise<Turn>;
}

// ----------------------------------------------------------------- catalogue

/** A spec value as it is stored and as it reads on the page. `numeric` is only set for number fields. */
export type SpecFact = { label: string; unit: string | null; display: string; numeric: number | null };

/** A published product with the details the rules may use. */
export type AssistantProduct = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  categorySlug: string;
  categoryName: string;
  image: ProductImage | null;
  /** Suitability tags curated by staff. Never inferred. */
  tags: Audience[];
  /** Keyed by the spec definition's key. Only fields that have a value are present. */
  specs: Record<string, SpecFact>;
};

export type ComparisonSource = {
  categoryName: string | null;
  products: { id: string; slug: string; name: string; brandName: string; categorySlug: string; specs: Record<string, string> }[];
  defs: { id: string; label: string; comparable: boolean; sort: number }[];
};

/** Where the engine reads products from. The real one reads the database, tests use a plain list. */
export interface CatalogueSource {
  /** Published products only. */
  productsInCategories(categorySlugs: string[]): Promise<AssistantProduct[]>;
  compare(productIds: string[]): Promise<ComparisonSource>;
}
