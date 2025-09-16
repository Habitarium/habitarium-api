import type { InferSelectModel } from "drizzle-orm";
import z from "zod";
import type { quests } from "../../db/schemas/quests";
import type { ActivityStatus } from "../activities/activity.entity";

export enum QuestFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export enum QuestType {
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
    dueDate: z.coerce.date("Invalid dueDate"),
    frequency: z.enum(QuestFrequency),
    parentId: z.uuid("Invalid parentId").optional(),
  })
  .strict();

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

export const updateQuestSchema = z
  .object({
    name: z.string("Name must be a string").optional(),
    icon: z.string().optional(),
    description: z.string("Description must be a string").optional(),
    difficulty: z.enum(QuestDifficulty).optional(),
    isPaused: z.boolean("isPaused must be a boolean").optional(),
    dueDate: z.coerce.date("Invalid dueDate").optional(),
    frequency: z.enum(QuestFrequency).optional(),
  })
  .strict();

export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;

export type QuestEntity = InferSelectModel<typeof quests> & {
  status?: ActivityStatus;
};
