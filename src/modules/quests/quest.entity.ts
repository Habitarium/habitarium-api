import type { InferSelectModel } from "drizzle-orm";
import z from "zod";
import type { quests } from "../../db/schemas/quests";

export enum QuestFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum QuestType {
  HABIT = "HABIT",
  TASK = "TASK",
}

export enum QuestDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  LEGENDARY = "LEGENDARY",
}

export const createQuestSchema = z
  .object({
    name: z.string("Name is required"),
    description: z.string("Description must be a string").optional(),
    type: z.enum(QuestType),
    difficulty: z.enum(QuestDifficulty),
    icon: z.string().optional(),
    dueDate: z.coerce.date("Invalid dueDate").optional(),
    frequency: z.enum(QuestFrequency),
    parentId: z.uuid("Invalid parentId").optional(),
  })
  .strict();

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

export const updateQuestSchema = z
  .object({
    id: z.uuid("Invalid id"),
    name: z.string("Name must be a string").optional(),
    icon: z.string().optional(),
    description: z.string("Description must be a string").optional(),
    difficulty: z.string("Difficulty must be a string").optional(),
    isPaused: z.boolean("isPaused must be a boolean").optional(),
    dueDate: z.coerce.date("Invalid dueDate").optional(),
    frequency: z.enum(QuestFrequency),
  })
  .strict();

export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;

export type QuestEntity = InferSelectModel<typeof quests>;
