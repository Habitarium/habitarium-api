import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  avatar: text("avatar"),
  nickname: text("nickname"),
  currentQuestlineKey: text("current_questline_key ")
    .notNull()
    .default("INITIAL"),
  level: integer("level").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  rankingPosition: integer("ranking_position").notNull(),
  lastQuestCompletedAt: timestamp("last_quest_completed_at"),
  badges: text("badges").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});
