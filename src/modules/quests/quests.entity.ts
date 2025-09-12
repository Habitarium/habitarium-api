import z from "zod";

export const createQuestSchema = z
  .object({
    name: z.string("Name is required"),
    description: z.string("Description must be a string").optional(),
    type: z.string("Type is required"),
    difficulty: z.string("Difficulty is required"),
    dueDate: z.coerce.date("Invalid dueDate").optional(),
    frequency: z.string("Frequency must be a string").optional(),
  })
  .strict();

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

export const updateQuestSchema = z
  .object({
    id: z.uuid("Invalid id"),
    characterId: z.uuid("Invalid characterId").optional(),
    name: z.string("Name must be a string").optional(),
    description: z.string("Description must be a string").optional(),
    type: z.string("Type must be a string").optional(),
    difficulty: z.string("Difficulty must be a string").optional(),
    isPaused: z.boolean("isPaused must be a boolean").optional(),
    dueDate: z.coerce.date("Invalid dueDate").optional(),
    frequency: z.string("Frequency must be a string").optional(),
    createdAt: z.coerce.date("Invalid createdAt").optional(),
    updatedAt: z.coerce.date("Invalid updatedAt").optional(),
  })
  .strict();

export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;

export interface QuestEntity {
  id: string;
  characterId: string;
  name: string;
  description?: string;
  type: string;
  difficulty: string;
  isPaused: boolean;
  dueDate?: Date;
  frequency?: string;
  createdAt: Date;
  updatedAt: Date;
}
