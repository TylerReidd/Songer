import { z } from "zod";

export const ideaIdSchema = z.string().min(1).max(64);

export const ideaInputSchema = z.object({
  title: z
    .string()
    .trim()
    .max(120)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
  content: z.string().trim().min(1, "Write something first").max(5_000),
});
export type IdeaInput = z.infer<typeof ideaInputSchema>;

export const attachIdeaSchema = z.object({
  ideaId: ideaIdSchema,
  songId: z.string().min(1).max(64).nullable(),
});
