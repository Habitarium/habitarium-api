import { DatabaseError, NotFoundError } from "../../utils/error-handler";
import { QuestDifficultyXp } from "../../utils/quests/quest-difficulty-xp";
import type { CharacterService } from "../characters/character.service";
import { QuestFrequency, QuestType } from "../quests/quest.entity";
import type { QuestService } from "../quests/quest.service";
import type { UserPublic } from "../users/user.entity";
import { ActivityStatus, type ActivityEntity } from "./activity.entity";
import type { ActivityRepository } from "./activity.repository";

type ActivityWithVirtual = ActivityEntity & { isVirtual?: boolean };

export class ActivityService {
  constructor(
    private readonly repo: ActivityRepository,
    private readonly characterService: CharacterService,
    private readonly questService: QuestService
  ) {}

  public async findById(
    activityId: string,
    authUser: UserPublic
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

  public async getActivitiesBetweenDates(
    range: { startAt: Date; endAt: Date },
    authUser: UserPublic
  ): Promise<ActivityWithVirtual[]> {
    const character = await this.characterService.findById(authUser.id);

    const characterQuests = [
      ...(await this.questService.findQuestsByCharacter(authUser)),
      ...(await this.questService.findQuestsByQuestline()),
    ];

    const activitiesFromDatabase: ActivityEntity[] =
      await this.repo.getActivitiesBetweenDates(range, character.id);

    const formatAsDayString = (date: Date) => date.toISOString().slice(0, 10);
    const startDayString = formatAsDayString(new Date(range.startAt));
    const endDayString = formatAsDayString(new Date(range.endAt));

    const activitiesResult: ActivityWithVirtual[] = [];

    for (
      let currentDate = new Date(startDayString);
      formatAsDayString(currentDate) <= endDayString;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const currentDayString = formatAsDayString(currentDate);
      const currentDay = new Date(currentDayString);

      for (const quest of characterQuests) {
        if (quest.isPaused) {
          const existingPaused = activitiesFromDatabase.find(
            (activity) =>
              activity.questId === quest.id &&
              formatAsDayString(new Date(activity.createdAt)) ===
                currentDayString
          );
          if (existingPaused) activitiesResult.push(existingPaused);
          continue;
        }

        const existingActivity = activitiesFromDatabase.find(
          (activity) =>
            activity.questId === quest.id &&
            formatAsDayString(new Date(activity.createdAt)) === currentDayString
        );

        if (existingActivity) {
          activitiesResult.push({ ...existingActivity, isVirtual: false });
          continue;
        }

        let questIsActiveToday = false;

        if (quest.type === QuestType.HABIT) {
          const referenceDay = new Date(quest.dueDate!);

          switch (quest.frequency) {
            case QuestFrequency.DAILY:
              questIsActiveToday = true;
              break;
            case QuestFrequency.WEEKLY:
              questIsActiveToday =
                currentDay.getUTCDay() === referenceDay.getUTCDay();
              break;
            case QuestFrequency.MONTHLY:
              questIsActiveToday =
                currentDay.getUTCDate() === referenceDay.getUTCDate();
              break;
            case QuestFrequency.YEARLY:
              questIsActiveToday =
                currentDay.getUTCMonth() === referenceDay.getUTCMonth() &&
                currentDay.getUTCDate() === referenceDay.getUTCDate();
              break;
            default:
              break;
          }
        }

        if (!questIsActiveToday) continue;

        activitiesResult.push({
          id: crypto.randomUUID(),
          createdAt: new Date(currentDayString),
          updatedAt: new Date(currentDayString),
          characterId: character.id,
          questId: quest.id,
          status: ActivityStatus.PENDING,
          closedAt: new Date(currentDayString),
          xpEarned: 0,
          isVirtual: true,
        });
      }
    }

    return activitiesResult;
  }

  public async create(
    data: { questId: string; closedAt: Date },
    authUser: UserPublic
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
    authUser: UserPublic
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
      authUser
    );

    return quest;
  }
}
