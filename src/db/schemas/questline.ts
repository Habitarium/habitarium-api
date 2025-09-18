import {
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { characters } from "./characters";

export const questlines = pgTable("questlines", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  questlineId: uuid("questline_id")
    .notNull()
    .references(() => questlines.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  xp: integer("xp").notNull(),
  difficulty: text("difficulty").notNull(),
  icon: text("icon"),
  content: json("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessonsProgress = pgTable("lessons_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  locked: boolean("locked").notNull().default(false),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
