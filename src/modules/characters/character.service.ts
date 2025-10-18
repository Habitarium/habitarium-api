import {
  ConflictError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error-handler";
import type { UserPublic } from "../users/user.entity";
import type {
  CharacterEntity,
  CharacterPublic,
  UpdateCharacterInput,
} from "./character.entity";
import type { CharacterRepository } from "./character.repository";
import type { QuestRepository } from "../quests/quest.repository";
import type { lessonsProgress } from "../../db/schemas/lessons-progress";

export class CharacterService {
  constructor(
    private readonly repo: CharacterRepository,
    private readonly questRepo: QuestRepository
  ) {}

  private getRequiredXp(level: number): number {
    return Math.floor(50 * Math.pow(level, 1.5));
  }

  public async getRanking(): Promise<CharacterPublic[]> {
    const ranking = await this.repo.findRanking();
    return ranking;
  }

  public async findAll(): Promise<CharacterEntity[]> {
    const characters = await this.repo.findAll();
    return characters;
  }

  public async findById(characterId: string): Promise<CharacterEntity> {
    const character = await this.repo.findById(characterId);
    if (!character) {
      throw new NotFoundError("Character not found", {
        details: { characterId },
      });
    }
    return character;
  }

  public async findByUserId(userId: string): Promise<CharacterEntity> {
    const character = await this.repo.findByUserId(userId);
    if (!character) {
      throw new NotFoundError("Character not found", {
        details: { userId },
      });
    }
    return character;
  }

  public async findLessonProgress(authUser: UserPublic) {
    const character = await this.findByUserId(authUser.id);
    const progress = await this.repo.findLessonProgress(character.id);
    return progress;
  }

  public async completeLesson(lessonId: string, authUser: UserPublic) {
    const character = await this.findByUserId(authUser.id);
    const lessonProgress = await this.repo.findLessonProgressByLessonId(
      character.id,
      lessonId
    );

    if (!lessonProgress) {
      throw new NotFoundError("Lesson progress not found");
    }

    if (lessonProgress.locked) {
      throw new ForbiddenError("This lesson is locked");
    }

    if (lessonProgress.completed) {
      return lessonProgress;
    }

    const lesson = await this.questRepo.findLessonById(lessonId);
    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    await this.addExperienceCharacter(lesson.xp, authUser);

    const updatedLp = await this.repo.updateLessonProgress(lessonProgress.id, {
      completed: true,
      progress: 100,
    });

    const nextLesson = await this.questRepo.findNextLesson(
      lesson.questlineId,
      lesson.sequenceIndex
    );

    if (nextLesson) {
      const nextLessonProgress = await this.repo.findLessonProgressByLessonId(
        character.id,
        nextLesson.id
      );
      if (nextLessonProgress) {
        await this.repo.updateLessonProgress(nextLessonProgress.id, {
          locked: false,
        });
      }
    }

    if (!nextLesson) {
      const currentLessonFull = await this.questRepo.findLessonById(lessonId);
      if (currentLessonFull) {
        const currentQuestline = await this.questRepo.findQuestlineById(
          currentLessonFull.questlineId
        );
        if (currentQuestline) {
          const nextQuestline =
            await this.questRepo.findQuestlineBySequenceIndex(
              currentQuestline.sequenceIndex + 1
            );
          if (nextQuestline) {
            const firstLessonNext = await this.questRepo.findFirstLesson(
              nextQuestline.id
            );
            if (firstLessonNext) {
              const firstLessonProgress =
                await this.repo.findLessonProgressByLessonId(
                  character.id,
                  firstLessonNext.id
                );
              if (firstLessonProgress) {
                await this.repo.updateLessonProgress(firstLessonProgress.id, {
                  locked: false,
                });
              }
            }
          }
        }
      }
    }

    return updatedLp;
  }

  public async updateLessonProgress(
    lessonProgressId: string,
    progress: number,
    authUser: UserPublic
  ) {
    const character = await this.findByUserId(authUser.id);
    const lessonProgress =
      await this.repo.findLessonProgressById(lessonProgressId);

    if (!lessonProgress || lessonProgress.characterId !== character.id) {
      throw new NotFoundError("Lesson progress not found");
    }

    const dataToUpdate: Partial<typeof lessonsProgress.$inferInsert> = {
      progress,
    };

    if (progress >= 100) {
      dataToUpdate.completed = true;
    }

    const updatedLp = await this.repo.updateLessonProgress(
      lessonProgressId,
      dataToUpdate
    );

    if (updatedLp?.completed) {
      const currentLesson = await this.questRepo.findLessonById(
        lessonProgress.lessonId
      );
      if (!currentLesson) return updatedLp;

      const nextLesson = await this.questRepo.findNextLesson(
        currentLesson.questlineId,
        currentLesson.sequenceIndex
      );
      if (!nextLesson) return updatedLp;

      const nextLessonProgress = await this.repo.findLessonProgressByLessonId(
        character.id,
        nextLesson.id
      );
      if (!nextLessonProgress) return updatedLp;

      await this.repo.updateLessonProgress(nextLessonProgress.id, {
        locked: false,
      });
    }

    return updatedLp;
  }

  public async addExperienceCharacter(
    xp: number,
    authUser: UserPublic
  ): Promise<CharacterEntity> {
    const found = await this.findByUserId(authUser.id);

    const accumulatedXp = found.totalXp + xp;
    let newLevel = found.level;

    while (accumulatedXp >= this.getRequiredXp(newLevel + 1)) {
      newLevel++;
    }

    const updatedCharacter: CharacterEntity = {
      ...found,
      totalXp: accumulatedXp,
      updatedAt: new Date(),
      level: newLevel,
    };

    const updated = await this.repo.update(updatedCharacter);
    if (!updated) {
      throw new DatabaseError("Failed to persist character update");
    }

    return updated;
  }

  public async create(user: UserPublic): Promise<CharacterEntity> {
    const existingCharacter = await this.repo.findByUserId(user.id);

    if (existingCharacter) {
      throw new ConflictError("UserId is already registered");
    }

    const allCharacters = await this.repo.findAll();

    const newCharacter: CharacterEntity = {
      id: crypto.randomUUID(),
      avatar: "INITIAL",
      nickname: user.name,
      currentQuestlineKey: "INITIAL",
      lastQuestCompletedAt: new Date(),
      level: 1,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      rankingPosition: allCharacters.length + 1,
      badges: [],
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.repo.create(newCharacter);
    if (!created) {
      throw new DatabaseError("Failed to persist character create");
    }

    await this.repo.createInitialLessonProgress(created.id);

    return created;
  }

  public async delete(
    characterId: string,
    authUser: UserPublic
  ): Promise<void> {
    const character = await this.findById(characterId);

    if (character.userId !== authUser.id) {
      throw new ForbiddenError("You are not allowed to delete this character");
    }

    const deleted = await this.repo.delete(characterId);
    if (!deleted) {
      throw new DatabaseError("Failed to persist character delete");
    }

    return;
  }

  public async update(
    characterId: string,
    data: UpdateCharacterInput,
    authUser: UserPublic
  ): Promise<CharacterEntity> {
    const character = await this.repo.findById(characterId);
    if (!character) {
      throw new NotFoundError("Character not found");
    }

    if (character.userId !== authUser.id) {
      throw new ForbiddenError("You are not allowed to update this character");
    }

    const updatedCharacter: CharacterEntity = {
      ...character,
      avatar: data.avatar ?? character.avatar,
    };

    const updated = await this.repo.update(updatedCharacter);
    if (!updated) {
      throw new DatabaseError("Failed to persist character update");
    }

    return updated;
  }
}
