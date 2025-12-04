import { db } from "../../db";
import { ActivityRepository } from "../activities/activity.repository";
import { ActivityService } from "../activities/activity.service";
import { CharacterRepository } from "../characters/character.repository";
import { CharacterService } from "../characters/character.service";
import { QuestController } from "./quest.controller";
import { QuestRepository } from "./quest.repository";
import { QuestService } from "./quest.service";

export function makeQuestController() {
  const questRepo = new QuestRepository(db);
  const activityRepo = new ActivityRepository(db);
  const characterRepo = new CharacterRepository(db);
  const characterService = new CharacterService(characterRepo, questRepo);

  // eslint-disable-next-line prefer-const
  let service: QuestService;
  const activityService = new ActivityService(
    activityRepo,
    characterService,
    () => service,
  );
  service = new QuestService(questRepo, characterService, activityService);

  return new QuestController(service);
}
