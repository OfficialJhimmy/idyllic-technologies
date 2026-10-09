import { z } from "zod";

export const contactTypes = ["contact", "quote"] as const;

const phone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || /^[+\d][\d\s().-]{6,}$/.test(v), "Enter a phone number, for example +234 703 797 3666")
  .transform((v) => (v === "" ? null : v));

export const contactInputSchema = z.object({
  type: z.enum(contactTypes).default("contact"),
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.email("Enter a valid email address").max(254),
  phone: phone.default(null),
  message: z.string().trim().min(10, "Tell us a little more, at least a sentence").max(4000, "Keep the message under 4000 characters"),
  /** Slug of the product the person is asking about. Optional. */
  productSlug: z.string().trim().max(80).optional().transform((v) => v || null),
  turnstileToken: z.string().max(4096).optional().default(""),
  /** Set when the visitor arrived from the Energy Assistant, so staff can see where the enquiry came from. */
  origin: z.literal("assistant").optional().catch(undefined),
  /** Honeypot. People never see it, so it must be empty. */
  website: z.string().max(0).default(""),
});
export type ContactInput = z.infer<typeof contactInputSchema>;
