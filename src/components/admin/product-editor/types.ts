import type { ProductDraft } from "@/lib/catalogue/types";

/** What every editor section receives. Errors are keyed by field, for example "slug" or "specs.<id>". */
export type SectionProps = {
  draft: ProductDraft;
  update: (patch: Partial<ProductDraft>) => void;
  errors: Record<string, string>;
};
