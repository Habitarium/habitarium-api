import { DatabaseError, NotFoundError } from "../../utils/error-handler";
import { ActivityStatus } from "../activities/activity.entity";
import type { ActivityService } from "../activities/activity.service";
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
    private readonly characterService: CharacterService,
    private readonly activityService: ActivityService
  ) {}

  public async findQuestsByCharacter(
    authUser: UserPublic
  ): Promise<QuestEntity[]> {
    const character = await this.characterService.findByUserId(authUser.id);
    const quests = await this.repo.findQuestsByCharacter(character.id);
    const activities = await this.activityService.findAll(authUser);

    const activityByQuestId = new Map(activities.map((a) => [a.questId, a]));

    const questsWithStatus = quests.map((quest) => ({
      ...quest,
      status:
        (activityByQuestId.get(quest.id)?.status as ActivityStatus) ??
        ActivityStatus.PENDING,
    }));

    return questsWithStatus;
  }

  public async findById(
    questId: string,
    authUser: UserPublic
  ): Promise<QuestEntity> {
    const character = await this.characterService.findByUserId(authUser.id);
    const quest = await this.repo.findById(questId);
    if (!quest) {
      throw new NotFoundError("Quest not found", {
        details: { questId },
      });
    } else if (!quest.questlineKey && character.id !== quest.characterId) {
      throw new NotFoundError("Quest not found", {
        details: { questId },
      });
    }

    return quest;
  }

  public async findByParentId(
    questId: string,
    authUser: UserPublic
  ): Promise<QuestEntity[]> {
    await this.findById(questId, authUser);
    const quests = await this.repo.findChildQuests(questId);
    return quests;
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
      content: null,
      icon: data.icon ?? null,
      type: data.type as QuestType,
      parentId: data.parentId ?? null,
      description: data.description ?? null,
      dueDate: data.dueDate,
      frequency: data.frequency as QuestFrequency,
    };

    const quest = await this.repo.create(newQuest);
    if (!quest) {
      throw new DatabaseError("Failed to persist quest");
    }

    await this.activityService.create(
      { questId: quest.id, closedAt: quest.dueDate },
      authUser
    );

    return quest;
  }

  public async update(
    questId: string,
    data: UpdateQuestInput,
    authUser: UserPublic
  ): Promise<QuestEntity> {
    const found = await this.findById(questId, authUser);
    const updatedQuest: QuestEntity = {
      ...found,
      ...data,
      name: data.name ?? found.name,
      icon: data.icon ?? found.icon,
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
