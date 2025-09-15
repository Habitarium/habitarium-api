import { eq, isNotNull, isNull, and } from "drizzle-orm";
import type { Db } from "../../db";
import { quests } from "../../db/schemas/quests";
import type { QuestEntity } from "./quest.entity";

export class QuestRepository {
  constructor(private readonly db: Db) {}

  public async findQuestsByCharacter(
    characterId: string
  ): Promise<QuestEntity[]> {
    const result = await this.db
      .select()
      .from(quests)
      .where(and(eq(quests.characterId, characterId), isNull(quests.parentId)));
    return result;
  }

  public async findQuestsByQuestline(): Promise<QuestEntity[]> {
    const result = await this.db
      .select()
      .from(quests)
      .where(and(isNotNull(quests.questlineKey), isNull(quests.parentId)));
    return result;
  }

  public async findChildQuests(questId: string): Promise<QuestEntity[]> {
    const result = await this.db
      .select()
      .from(quests)
      .where(eq(quests.parentId, questId));
    return result;
  }

  public async findById(questId: string): Promise<QuestEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(quests)
      .where(eq(quests.id, questId));
    return result;
  }

  public async create(data: QuestEntity): Promise<QuestEntity | undefined> {
    const [result] = await this.db.insert(quests).values(data).returning();
    return result;
  }

  public async update(data: QuestEntity): Promise<QuestEntity | undefined> {
    const [result] = await this.db
      .update(quests)
      .set(data)
      .where(eq(quests.id, data.id))
      .returning();
    return result;
  }

  public async delete(questId: string): Promise<boolean> {
    const [result] = await this.db
      .delete(quests)
      .where(eq(quests.id, questId))
      .returning();
    return !!result;
  }
}
