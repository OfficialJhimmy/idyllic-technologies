import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/catalogue/slug";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null);

const slug = z.string().trim().min(1, "Add a slug").max(80).regex(SLUG_PATTERN, "Use lower case letters, digits and hyphens");

export const postInputSchema = z.object({
  id: z.uuid().nullable(),
  title: z.string().trim().min(1, "Add a title").max(200),
  slug,
  excerpt: optionalText(500),
  body: z.string().max(200_000),
  featuredMediaId: z.uuid().nullable().default(null),
  categoryId: z.uuid().nullable().default(null),
  authorId: z.uuid().nullable().default(null),
  tags: z.array(z.string().trim().min(1).max(40)).max(15),
  /** ISO date and time, or null to keep the stored date (or use now when publishing). */
  publishedAt: z.iso.datetime({ offset: true }).nullable().default(null),
  seoTitle: optionalText(120),
  seoDescription: optionalText(300),
  ogImageMediaId: z.uuid().nullable().default(null),
});
export type PostInput = z.infer<typeof postInputSchema>;

export const taxonomyInputSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().trim().min(1, "Add a name").max(80),
  slug,
});
export type TaxonomyInput = z.infer<typeof taxonomyInputSchema>;

export const authorInputSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().trim().min(1, "Add a name").max(120),
  slug,
  bio: optionalText(2000),
  avatarMediaId: z.uuid().nullable().default(null),
});
export type AuthorInput = z.infer<typeof authorInputSchema>;
