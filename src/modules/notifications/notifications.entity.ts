import type { InferSelectModel } from "drizzle-orm";
import z from "zod";
import type { notifications } from "../../db/schemas/notifications";

export const updateNotificationSchema = z.object({
  id: z.uuid("Invalid id").optional(),
  isRead: z.boolean("isRead must be a boolean"),
});

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

export type NotificationEntity = InferSelectModel<typeof notifications>;
