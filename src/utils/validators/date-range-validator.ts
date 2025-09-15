import z from "zod";

export const dateRangeQuerySchema = z
  .object({
    startAt: z.coerce.date("startAt must be a date"),
    endAt: z.coerce.date("endAt must be a date"),
  })
  .refine((q) => q.startAt <= q.endAt, {
    message: "Invalid range: startAt must be earlier than or equal to endAt.",
    path: ["startAt"],
  });
