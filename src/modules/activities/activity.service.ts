import { DatabaseError, NotFoundError } from "../../utils/error-handler";
import { QuestDifficultyXp } from "../../utils/quests/quest-difficulty-xp";
import type { CharacterService } from "../characters/character.service";
import type { QuestService } from "../quests/quest.service";
import type { UserPublic } from "../users/user.entity";
import { ActivityStatus, type ActivityEntity } from "./activity.entity";
import type { ActivityRepository } from "./activity.repository";

type ActivityWithVirtual = ActivityEntity & { isVirtual?: boolean };

export class ActivityService {
  private _questService?: QuestService;

  constructor(
    private readonly repo: ActivityRepository,
    private readonly characterService: CharacterService,
    private readonly questServiceFactory: () => QuestService,
  ) {}

  private get questService(): QuestService {
    if (!this._questService) {
      this._questService = this.questServiceFactory();
    }
    return this._questService;
  }

  public async findAll(authUser: UserPublic): Promise<ActivityEntity[]> {
    const character = await this.characterService.findByUserId(authUser.id);
    const activities = await this.repo.findAll(character.id);
    return activities;
  }

  public async findById(
    activityId: string,
    authUser: UserPublic,
  ): Promise<ActivityEntity> {
    const character = await this.characterService.findByUserId(authUser.id);
    const activity = await this.repo.findById(activityId);

    if (!activity || character.id !== activity.characterId) {
      throw new NotFoundError("Activity not found", {
        details: { activityId },
      });
    }

    return activity;
  }

  public async findByQuestId(authUser: UserPublic): Promise<ActivityEntity[]> {
    const character = await this.characterService.findByUserId(authUser.id);
    const activities = await this.repo.findAll(character.id);
    return activities;
  }

  public async getActivitiesBetweenDates(
    range: { startAt: Date; endAt: Date },
    authUser: UserPublic,
  ): Promise<ActivityWithVirtual[]> {
    const character = await this.characterService.findById(authUser.id);

    const characterQuests = [
      ...(await this.questService.findQuestsByCharacter(authUser)),
      ...(await this.questService.findQuestsByQuestline()),
    ];

    const activitiesFromDatabase = await this.repo.getActivitiesBetweenDates(
      range,
      character.id,
    );

    const activitiesResult: ActivityWithVirtual[] = [];

    const startOfDayUTC = (date: Date) => {
      return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
      );
    };

    for (
      let currentDate = startOfDayUTC(range.startAt);
      currentDate <= startOfDayUTC(range.endAt);
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      for (const quest of characterQuests) {
        const existingActivity = activitiesFromDatabase.find(
          (activity) =>
            activity.questId === quest.id &&
            startOfDayUTC(activity.createdAt) === currentDate,
        );

        if (existingActivity) {
          activitiesResult.push({ ...existingActivity, isVirtual: false });
          continue;
        }

        if (quest.isPaused) continue;

        activitiesResult.push({
          id: crypto.randomUUID(),
          createdAt: currentDate,
          updatedAt: currentDate,
          characterId: character.id,
          questId: quest.id,
          status: ActivityStatus.PENDING,
          closedAt: currentDate,
          xpEarned: 0,
          isVirtual: true,
        });
      }
    }

    return activitiesResult;
  }

  public async create(
    data: { questId: string; closedAt: Date },
    authUser: UserPublic,
  ): Promise<ActivityEntity> {
    const character = await this.characterService.findByUserId(authUser.id);

    const quest = await this.questService.findById(data.questId, authUser);

    const newActivity: ActivityEntity = {
      id: crypto.randomUUID(),
      characterId: character.id,
      questId: data.questId,
      status: ActivityStatus.PENDING,
      closedAt: data.closedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      xpEarned: QuestDifficultyXp[quest.difficulty],
    };

    const created = await this.repo.create(newActivity);
    if (!created) {
      throw new DatabaseError("Failed to persist activity create");
    }

    return created;
  }

  public async complete(
    activityId: string,
    authUser: UserPublic,
  ): Promise<ActivityEntity> {
    const found = await this.findById(activityId, authUser);

    const now = new Date();
    let status: ActivityStatus;
    if (found.closedAt >= now) {
      status = ActivityStatus.COMPLETED;
    } else {
      status = ActivityStatus.DELAYED;
    }

    const updatedActivity: ActivityEntity = {
      ...found,
      status,
      updatedAt: now,
    };

    const quest = await this.repo.update(updatedActivity);
    if (!quest) {
      throw new DatabaseError("Failed to persist activity complete");
    }

    await this.characterService.addExperienceCharacter(
      found.xpEarned,
      authUser,
    );

    return quest;
  }
}
