import { relations } from "drizzle-orm";
import { characters } from "./characters";
import { notifications } from "./notifications";
import { quests } from "./quests";
import { users } from "./users";
import { activityQuests } from "./activity-quests";

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
  activityQuests: many(activityQuests),
  notifications: many(notifications),
}));

export const questsRelations = relations(quests, ({ one, many }) => ({
  character: one(characters, {
    fields: [quests.characterId],
    references: [characters.id],
  }),
  activityQuests: many(activityQuests),
}));

export const activityQuestsRelations = relations(activityQuests, ({ one }) => ({
  quest: one(quests, {
    fields: [activityQuests.questId],
    references: [quests.id],
  }),
  character: one(characters, {
    fields: [activityQuests.characterId],
    references: [characters.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  character: one(characters, {
    fields: [notifications.characterId],
    references: [characters.id],
  }),
}));
