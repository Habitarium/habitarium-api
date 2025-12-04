import { db } from "../../db";
import { CharacterRepository } from "../characters/character.repository";
import { CharacterService } from "../characters/character.service";
import { QuestRepository } from "../quests/quest.repository";
import { UserRepository } from "../users/user.repository";
import { UserService } from "../users/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { SupabaseAuthService } from "./supabase-auth.service";

export function makeAuthController() {
  const userRepository = new UserRepository(db);
  const characterRepository = new CharacterRepository(db);
  const questRepository = new QuestRepository(db);
  const characterService = new CharacterService(
    characterRepository,
    questRepository,
  );
  const userService = new UserService(userRepository, characterService);
  const service = new AuthService(userRepository, userService);
  const supabaseService = new SupabaseAuthService(userRepository, userService);
  return new AuthController(service, supabaseService);
}
