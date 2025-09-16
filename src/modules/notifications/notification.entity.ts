import type { InferSelectModel } from "drizzle-orm";
import z from "zod";
import type { notifications } from "../../db/schemas/notifications";

export type CreateNotificationInput = {
  title: string;
  description: string;
  type: string;
};

export const updateNotificationSchema = z.object({
  isRead: z.boolean("isRead must be a boolean"),
});

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

export type NotificationEntity = InferSelectModel<typeof notifications>;
