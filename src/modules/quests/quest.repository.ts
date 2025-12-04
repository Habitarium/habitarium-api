import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "../../db";
import { quests } from "../../db/schemas/quests";
import { questlines } from "../../db/schemas/questline";
import type { QuestEntity } from "./quest.entity";
import { lessons } from "../../db/schemas/lessons";

export class QuestRepository {
  constructor(private readonly db: Db) {}

  public async findQuestsByCharacter(
    characterId: string,
  ): Promise<QuestEntity[]> {
    const result = await this.db
      .select()
      .from(quests)
      .where(and(eq(quests.characterId, characterId), isNull(quests.parentId)));
    return result;
  }

  public async findQuestlinesWithLessons(): Promise<
    Array<ReturnType<typeof Object.assign>>
  > {
    const questlinesResult = await this.db.select().from(questlines);
    const lessonsResult = await this.db.select().from(lessons);

    const lessonsByQuestlineId = new Map<string, typeof lessonsResult>();
    for (const l of lessonsResult) {
      const arr = lessonsByQuestlineId.get(l.questlineId) ?? [];
      arr.push(l);
      lessonsByQuestlineId.set(l.questlineId, arr);
    }

    return questlinesResult.map((ql) => ({
      ...ql,
      lessons: lessonsByQuestlineId.get(ql.id) ?? [],
    }));
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

  public async findLessonById(lessonId: string) {
    const [lesson] = await this.db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId));
    return lesson;
  }

  public async findNextLesson(questlineId: string, sequenceIndex: number) {
    const [lesson] = await this.db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.questlineId, questlineId),
          eq(lessons.sequenceIndex, sequenceIndex + 1),
        ),
      );
    return lesson;
  }

  public async findQuestlineById(questlineId: string) {
    const [ql] = await this.db
      .select()
      .from(questlines)
      .where(eq(questlines.id, questlineId));
    return ql;
  }

  public async findQuestlineBySequenceIndex(sequenceIndex: number) {
    const [ql] = await this.db
      .select()
      .from(questlines)
      .where(eq(questlines.sequenceIndex, sequenceIndex));
    return ql;
  }

  public async findFirstLesson(questlineId: string) {
    const [lesson] = await this.db
      .select()
      .from(lessons)
      .where(eq(lessons.questlineId, questlineId))
      .orderBy(asc(lessons.sequenceIndex))
      .limit(1);
    return lesson;
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
