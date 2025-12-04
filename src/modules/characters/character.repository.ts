import { and, asc, eq } from "drizzle-orm";
import type { Db } from "../../db";
import { characters } from "../../db/schemas/characters";
import { questlines } from "../../db/schemas/questline";
import type { CharacterEntity, CharacterPublic } from "./character.entity";
import { lessons } from "../../db/schemas/lessons";
import { lessonsProgress } from "../../db/schemas/lessons-progress";

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
    const allLessons = await this.db
      .select({
        id: lessons.id,
        questlineId: lessons.questlineId,
        title: lessons.title,
        description: lessons.description,
        xp: lessons.xp,
        difficulty: lessons.difficulty,
        icon: lessons.icon,
        content: lessons.content,
        sequenceIndex: lessons.sequenceIndex,
        createdAt: lessons.createdAt,
      })
      .from(lessons)
      .innerJoin(questlines, eq(lessons.questlineId, questlines.id))
      .orderBy(asc(questlines.sequenceIndex), asc(lessons.sequenceIndex));

    if (!allLessons.length) {
      return;
    }

    const progressToInsert = allLessons.map((lesson, index) => ({
      id: crypto.randomUUID(),
      characterId,
      lessonId: lesson.id,
      completed: false,
      locked: index !== 0,
      progress: 0,
      createdAt: new Date(),
    }));

    await this.db.insert(lessonsProgress).values(progressToInsert);
  }

  public async findLessonProgressById(id: string) {
    const [result] = await this.db
      .select()
      .from(lessonsProgress)
      .where(eq(lessonsProgress.id, id));
    return result;
  }

  public async findLessonProgressByLessonId(
    characterId: string,
    lessonId: string,
  ) {
    const [result] = await this.db
      .select()
      .from(lessonsProgress)
      .where(
        and(
          eq(lessonsProgress.characterId, characterId),
          eq(lessonsProgress.lessonId, lessonId),
        ),
      );
    return result;
  }

  public async updateLessonProgress(
    id: string,
    data: Partial<typeof lessonsProgress.$inferInsert>,
  ) {
    const [result] = await this.db
      .update(lessonsProgress)
      .set(data)
      .where(eq(lessonsProgress.id, id))
      .returning();
    return result;
  }

  public async findById(
    characterId: string,
  ): Promise<CharacterEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(characters)
      .where(eq(characters.id, characterId));
    return result;
  }

  public async findByUserId(
    userId: string,
  ): Promise<CharacterEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(characters)
      .where(eq(characters.userId, userId));
    return result;
  }

  public async findAll(): Promise<CharacterEntity[]> {
    const result = await this.db
      .select()
      .from(characters)
      .orderBy(asc(characters.rankingPosition));
    return result;
  }

  public async findRanking(): Promise<CharacterPublic[]> {
    const result = await this.db
      .select({
        id: characters.id,
        nickname: characters.nickname,
        avatar: characters.avatar,
        level: characters.level,
        totalXp: characters.totalXp,
        rankingPosition: characters.rankingPosition,
      })
      .from(characters)
      .orderBy(asc(characters.rankingPosition));
    return result;
  }

  public async update(
    data: CharacterEntity,
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
    data: CharacterEntity,
  ): Promise<CharacterEntity | undefined> {
    const [result] = await this.db.insert(characters).values(data).returning();
    return result;
  }
}
