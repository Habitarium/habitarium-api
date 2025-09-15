import {
  DatabaseError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error-handler";
import type { CharacterService } from "../characters/character.service";
import type { UserPublic } from "../users/user.entity";
import type {
  CreateQuestInput,
  QuestDifficulty,
  QuestEntity,
  QuestFrequency,
  QuestType,
  UpdateQuestInput,
} from "./quest.entity";
import type { QuestRepository } from "./quest.repository";

export class QuestService {
  constructor(
    private readonly repo: QuestRepository,
    private readonly characterService: CharacterService
  ) {}

  public async findQuestsByCharacter(
    authUser: UserPublic
  ): Promise<QuestEntity[]> {
    const character = await this.characterService.findByUserId(authUser.id);
    const quests = await this.repo.findQuestsByCharacter(character.id);
    return quests;
  }

  public async findById(
    questId: string,
    authUser: UserPublic
  ): Promise<QuestEntity> {
    const character = await this.characterService.findByUserId(authUser.id);
    const quest = await this.repo.findById(questId);
    if (!quest || character.id !== quest.characterId) {
      throw new NotFoundError("Quest not found", {
        details: { questId },
      });
    }
    return quest;
  }

  public async create(
    data: CreateQuestInput,
    authUser: UserPublic
  ): Promise<QuestEntity> {
    const character = await this.characterService.findByUserId(authUser.id);

    const newQuest: QuestEntity = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      characterId: character.id,
      questlineKey: null,
      questlineKind: null,
      sequenceIndex: null,
      isPaused: false,
      type: data.type as QuestType,
      parentId: data.parentId ?? null,
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      frequency: data.frequency as QuestFrequency,
    };

    const quest = await this.repo.create(newQuest);
    if (!quest) {
      throw new DatabaseError("Failed to persist quest");
    }

    return quest;
  }

  public async update(
    questId: string,
    data: UpdateQuestInput,
    authUser: UserPublic
  ): Promise<QuestEntity> {
    if (questId !== data.id) {
      throw new ForbiddenError("You are not allowed to update this quest");
    }

    const found = await this.findById(questId, authUser);
    const updatedQuest: QuestEntity = {
      ...found,
      ...data,
      name: data.name ?? found.name,
      description: data.description ?? found.description,
      difficulty: (data.difficulty as QuestDifficulty) ?? found.difficulty,
      dueDate: data.dueDate ?? found.dueDate,
      isPaused: data.isPaused ?? found.isPaused,
      frequency: (data.frequency as QuestFrequency) ?? found.frequency,
      updatedAt: new Date(),
    };

    const quest = await this.repo.update(updatedQuest);
    if (!quest) {
      throw new DatabaseError("Failed to persist quest update");
    }

    return quest;
  }

  public async delete(questId: string, authUser: UserPublic): Promise<void> {
    await this.findById(questId, authUser);

    const quest = await this.repo.delete(questId);
    if (!quest) {
      throw new DatabaseError("Failed to persist quest delete");
    }

    return;
  }

  public async findQuestsByQuestline(): Promise<QuestEntity[]> {
    const quests = await this.repo.findQuestsByQuestline();
    return quests;
  }
}
