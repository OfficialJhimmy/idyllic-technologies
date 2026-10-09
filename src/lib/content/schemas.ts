import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v)).nullable().default(null);

export const faqInputSchema = z.object({
  id: z.uuid().nullable(),
  question: z.string().trim().min(1, "Add the question").max(300),
  answer: z.string().trim().min(1, "Add the answer").max(4000),
});
export type FaqInput = z.infer<typeof faqInputSchema>;

export const testimonialInputSchema = z.object({
  id: z.uuid().nullable(),
  quote: z.string().trim().min(1, "Add the quote").max(1500),
  authorName: z.string().trim().min(1, "Add the name").max(120),
  authorRole: optionalText(120),
  avatarMediaId: z.uuid().nullable().default(null),
});
export type TestimonialInput = z.infer<typeof testimonialInputSchema>;

export const clientInputSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().trim().min(1, "Add the name").max(120),
  kind: z.enum(["client", "partner"]),
  logoMediaId: z.uuid().nullable().default(null),
  url: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Enter a full link starting with http:// or https://")
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
});
export type ClientInput = z.infer<typeof clientInputSchema>;

export const contentKinds = ["faq", "testimonial", "client"] as const;
export type ContentKind = (typeof contentKinds)[number];
export const contentStatuses = ["draft", "published"] as const;
