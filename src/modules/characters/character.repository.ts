import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import { characters } from "../../db/schemas/characters";
import { lessons, lessonsProgress } from "../../db/schemas/questline";
import type { CharacterEntity } from "./character.entity";

export class CharacterRepository {
  constructor(private readonly db: Db) {}

  public async findLessonProgress(characterId: string) {
    const result = await this.db
      .select()
      .from(lessonsProgress)
      .where(eq(lessonsProgress.characterId, characterId));
    return result;
  }

  public async createInitialLessonProgress(characterId: string) {
    const allLessons = await this.db.select().from(lessons);
    if (!allLessons.length) {
      return;
    }

    const progressToInsert = allLessons.map((lesson, index) => ({
      id: crypto.randomUUID(),
      characterId,
      lessonId: lesson.id,
      completed: false,
      locked: index !== 0, // Desbloqueia apenas a primeira lição
      progress: 0,
      createdAt: new Date(),
    }));

    await this.db.insert(lessonsProgress).values(progressToInsert);
  }

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
