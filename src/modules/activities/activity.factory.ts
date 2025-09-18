import { db } from "../../db";
import { CharacterRepository } from "../characters/character.repository";
import { CharacterService } from "../characters/character.service";
import { QuestRepository } from "../quests/quest.repository";
import { QuestService } from "../quests/quest.service";
import { ActivityController } from "./activity.controller";
import { ActivityRepository } from "./activity.repository";
import { ActivityService } from "./activity.service";

export function makeActivityController() {
  const repo = new ActivityRepository(db);
  const characterRepo = new CharacterRepository(db);
  const questRepo = new QuestRepository(db);
  const characterService = new CharacterService(characterRepo, questRepo);
  const questService = new QuestService(questRepo, characterService);
  const service = new ActivityService(repo, characterService, questService);
  return new ActivityController(service);
}
