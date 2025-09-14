import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import { quests } from "../../db/schemas/quests";
import type { QuestEntity } from "./quest.entity";

export class QuestRepository {
  constructor(private readonly db: Db) {}

  public async findByCharacterId(characterId: string): Promise<QuestEntity[]> {
    const result = await this.db
      .select()
      .from(quests)
      .where(eq(quests.characterId, characterId));

    return result;
  }
}
