import {
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { questlines } from "./questline";

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
  sequenceIndex: integer("sequence_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
