import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { characters } from "./characters";
import { questlines, questlineStatusEnum } from "./questline";

export const questlineProgress = pgTable(
  "character_questline_progress",
  {
    characterId: uuid("character_id")
      .notNull()
      .references(() => characters.id),
    questlineId: uuid("questline_id")
      .notNull()
      .references(() => questlines.id),
    status: questlineStatusEnum("status").default("locked").notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.characterId, table.questlineId] }),
    };
  },
);
