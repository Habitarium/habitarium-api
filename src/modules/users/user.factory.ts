import { db } from "../../db";
import { CharacterRepository } from "../characters/character.repository";
import { CharacterService } from "../characters/character.service";
import { QuestRepository } from "../quests/quest.repository";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

export function makeUserController() {
  const repo = new UserRepository(db);
  const characterRepository = new CharacterRepository(db);
  const questRepository = new QuestRepository(db);
  const characterService = new CharacterService(
    characterRepository,
    questRepository,
  );
  const service = new UserService(repo, characterService);
  return new UserController(service);
}
