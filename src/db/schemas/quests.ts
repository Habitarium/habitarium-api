import {
  boolean,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { characters } from "./characters";

export const questFrequencyEnum = pgEnum("quest_frequency", [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
]);

export const questTypeEnum = pgEnum("quest_type", ["HABIT", "TASK"]);

export const questDifficultyEnum = pgEnum("quest_difficulty", [
  "EASY",
  "MEDIUM",
  "HARD",
  "LEGENDARY",
]);

export const quests = pgTable("quests", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  questlineKey: text("questline_key"),
  questlineKind: text("questline_kind"),
  sequenceIndex: text("sequence_index"),
  parentId: uuid("parent_id").references((): AnyPgColumn => quests.id),
  name: text("name").notNull(),
  icon: text("icon"),
  content: json("content"),
  description: text("description"),
  type: questTypeEnum("type").notNull(),
  difficulty: questDifficultyEnum("difficulty").notNull(),
  dueDate: timestamp("due_date"),
  isPaused: boolean("is_paused").notNull().default(false),
  frequency: questFrequencyEnum("frequency"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});
