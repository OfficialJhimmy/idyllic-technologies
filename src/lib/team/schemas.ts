import { z } from "zod";

export const inviteSchema = z.object({
  email: z.email("Enter a valid email address").max(254).transform((v) => v.trim().toLowerCase()),
  role: z.enum(["owner", "editor"], { message: "Choose a role" }),
});

export const roleChangeSchema = z.object({ userId: z.uuid(), role: z.enum(["owner", "editor"]) });
export const userIdSchema = z.object({ userId: z.uuid() });

/** At least 12 characters, with a letter and a number. Long and unguessable matters more than symbols. */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(128, "Keep it under 128 characters")
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Include at least one letter and one number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords do not match", path: ["confirm"] });

export const inviteTokenSchema = z.object({
  tokenHash: z.string().min(10).max(200).regex(/^[A-Za-z0-9_-]+$/),
  type: z.enum(["invite", "magiclink"]),
});
