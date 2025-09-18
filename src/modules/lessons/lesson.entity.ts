import z from "zod";

export const updateLessonProgressSchema = z
  .object({
    progress: z
      .number()
      .min(0, "Progress must be at least 0")
      .max(100, "Progress must be at most 100"),
  })
  .strict();

export type UpdateLessonProgressInput = z.infer<
  typeof updateLessonProgressSchema
>;
