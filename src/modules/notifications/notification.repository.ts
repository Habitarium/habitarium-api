import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import type { NotificationEntity } from "./notification.entity";
import { notifications } from "../../db/schemas/notifications";

export class NotificationRepository {
  constructor(private readonly db: Db) {}

  public async findAll(characterId: string): Promise<NotificationEntity[]> {
    const result = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.characterId, characterId));
    return result;
  }

  public async findById(
    notificationId: string,
  ): Promise<NotificationEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, notificationId));
    return result;
  }

  public async create(
    data: NotificationEntity,
  ): Promise<NotificationEntity | undefined> {
    const [result] = await this.db
      .insert(notifications)
      .values(data)
      .returning();
    return result;
  }

  public async update(
    data: NotificationEntity,
  ): Promise<NotificationEntity | undefined> {
    const [result] = await this.db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, data.id))
      .returning();
    return result;
  }

  public async delete(notificationId: string): Promise<boolean> {
    const [result] = await this.db
      .delete(notifications)
      .where(eq(notifications.id, notificationId))
      .returning();
    return !!result;
  }
}
