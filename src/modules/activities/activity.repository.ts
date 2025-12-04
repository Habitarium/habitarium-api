import { eq, and, gte, lte } from "drizzle-orm";
import type { Db } from "../../db";
import { activities } from "../../db/schemas/activities";
import type { ActivityEntity } from "./activity.entity";

export class ActivityRepository {
  constructor(private readonly db: Db) {}

  public async findAll(characterId: string): Promise<ActivityEntity[]> {
    const result = await this.db
      .select()
      .from(activities)
      .where(eq(activities.characterId, characterId));
    return result;
  }

  public async getActivitiesBetweenDates(
    data: { startAt: Date; endAt: Date },
    characterId: string,
  ): Promise<ActivityEntity[]> {
    const result = await this.db
      .select()
      .from(activities)
      .where(
        and(
          eq(activities.characterId, characterId),
          gte(activities.closedAt, data.startAt),
          lte(activities.closedAt, data.endAt),
        ),
      );
    return result;
  }

  public async findById(
    activityId: string,
  ): Promise<ActivityEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId));
    return result;
  }

  public async create(
    data: ActivityEntity,
  ): Promise<ActivityEntity | undefined> {
    const [result] = await this.db.insert(activities).values(data).returning();
    return result;
  }

  public async update(
    data: ActivityEntity,
  ): Promise<ActivityEntity | undefined> {
    const [result] = await this.db
      .update(activities)
      .set(data)
      .where(eq(activities.id, data.id))
      .returning();
    return result;
  }

  public async delete(activityId: string): Promise<boolean> {
    const [result] = await this.db
      .delete(activities)
      .where(eq(activities.id, activityId))
      .returning();
    return !!result;
  }
}
