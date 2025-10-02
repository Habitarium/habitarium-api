import { relations } from "drizzle-orm";
import { characters } from "./characters";
import { notifications } from "./notifications";
import { quests } from "./quests";
import { questlines } from "./questline";
import { users } from "./users";
import { activities } from "./activities";
import { lessons } from "./lessons";
import { lessonsProgress } from "./lessons-progress";

export const usersRelations = relations(users, ({ one }) => ({
  character: one(characters, {
    fields: [users.id],
    references: [characters.userId],
  }),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
  user: one(users, {
    fields: [characters.userId],
    references: [users.id],
  }),
  quests: many(quests),
  activities: many(activities),
  notifications: many(notifications),
}));

export const questsRelations = relations(quests, ({ one, many }) => ({
  character: one(characters, {
    fields: [quests.characterId],
    references: [characters.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  quest: one(quests, {
    fields: [activities.questId],
    references: [quests.id],
  }),
  character: one(characters, {
    fields: [activities.characterId],
    references: [characters.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  character: one(characters, {
    fields: [notifications.characterId],
    references: [characters.id],
  }),
}));

export const questlinesRelations = relations(questlines, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  questline: one(questlines, {
    fields: [lessons.questlineId],
    references: [questlines.id],
  }),
}));

export const lessonsProgressRelations = relations(
  lessonsProgress,
  ({ one }) => ({
    lesson: one(lessons, {
      fields: [lessonsProgress.lessonId],
      references: [lessons.id],
    }),
    character: one(characters, {
      fields: [lessonsProgress.characterId],
      references: [characters.id],
    }),
  })
);
