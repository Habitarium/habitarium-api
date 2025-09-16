import type { InferSelectModel } from "drizzle-orm";
import type { characters } from "../../db/schemas/characters";
import z from "zod";

export const updateCharacterSchema = z
  .object({
    avatar: z.string().optional(),
    nickname: z.string().optional(),
  })
  .strict();

export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;

export type CharacterEntity = InferSelectModel<typeof characters>;
