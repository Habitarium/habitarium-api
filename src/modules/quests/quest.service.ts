import {
  DatabaseError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error-handler";
import type { CharacterEntity } from "../characters/character.entity";
import type { CharacterRepository } from "../characters/character.repository";
import type { UserPublic } from "../users/user.entity";
import type {
  CreateQuestInput,
  QuestEntity,
  UpdateQuestInput,
} from "./quest.entity";
import type { QuestRepository } from "./quest.repository";

export class QuestService {
  constructor(
    private readonly repo: QuestRepository,
    private readonly characterRepo: CharacterRepository
  ) {}

  private async findCharacterByUserId(
    userId: string
  ): Promise<CharacterEntity> {
    const character = await this.characterRepo.findByUserId(userId);
    if (!character) {
      throw new ForbiddenError(
        "You must have a character to perform this action"
      );
    }
    return character;
  }

  public async findById(
    questId: string,
    userToken: UserPublic
  ): Promise<QuestEntity> {
    const character = await this.findCharacterByUserId(userToken.id);
    const quest = await this.repo.findById(questId);
    if (!quest) {
      throw new NotFoundError("Quest not found", {
        details: { questId },
      });
    }
    if (character.id !== quest.characterId) {
      throw new ForbiddenError(
        "You must have a character to perform this action"
      );
    }
    return quest;
  }

  public async create(
    data: CreateQuestInput,
    userToken: UserPublic
  ): Promise<QuestEntity> {
    const character = await this.findCharacterByUserId(userToken.id);

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
      parentId: data.parentId ?? null,
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      frequency: data.frequency ?? null,
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
    userToken: UserPublic
  ): Promise<QuestEntity> {
    if (questId !== data.id) {
      throw new ForbiddenError("You are not allowed to update this quest");
    }

    const found = await this.findById(questId, userToken);
    const updatedQuest: QuestEntity = {
      ...found,
      ...data,
      name: data.name ?? found.name,
      description: data.description ?? found.description,
      difficulty: data.difficulty ?? found.difficulty,
      dueDate: data.dueDate ?? found.dueDate,
      isPaused: data.isPaused ?? found.isPaused,
      frequency: data.frequency ?? found.frequency,
      updatedAt: new Date(),
    };

    const quest = await this.repo.update(updatedQuest);
    if (!quest) {
      throw new DatabaseError("Failed to persist quest update");
    }

    return quest;
  }

  public async delete(questId: string, userToken: UserPublic): Promise<void> {
    await this.findById(questId, userToken);
    const quest = await this.repo.delete(questId);
    if (!quest) {
      throw new DatabaseError("Failed to persist quest delete");
    }

    return;
  }
}
