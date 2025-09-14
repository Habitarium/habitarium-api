import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import { characters } from "../../db/schemas/characters";
import type { CharacterEntity } from "./character.entity";

export class CharacterRepository {
  constructor(private readonly db: Db) {}

  public async findById(
    characterId: string
  ): Promise<CharacterEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId));
    return result;
  }

  public async findByUserId(
    userId: string
  ): Promise<CharacterEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(characters)
      .where(eq(characters.userId, userId));
    return result;
  }

  public async findAll(): Promise<CharacterEntity[]> {
    const result = await this.db.select().from(characters);
    return result;
  }

  public async update(
    data: CharacterEntity
  ): Promise<CharacterEntity | undefined> {
    const [result] = await this.db
      .update(characters)
      .set(data)
      .where(eq(characters.id, data.id))
      .returning();
    return result;
  }

  public async delete(characterId: string): Promise<boolean> {
    const [result] = await this.db
      .delete(characters)
      .where(eq(characters.id, characterId))
      .returning();
    return !!result;
  }

  public async create(
    data: CharacterEntity
  ): Promise<CharacterEntity | undefined> {
    const [result] = await this.db.insert(characters).values(data).returning();
    return result;
  }
}
