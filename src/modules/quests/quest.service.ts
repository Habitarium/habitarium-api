import { ForbiddenError, NotFoundError } from "../../utils/error-handler";
import type { CharacterRepository } from "../characters/character.repository";
import type { UserPublic } from "../users/user.entity";
import type { QuestEntity } from "./quest.entity";
import type { QuestRepository } from "./quest.repository";

export class QuestService {
  constructor(
    private readonly repo: QuestRepository,
    private readonly characterRepo: CharacterRepository
  ) {}

  public async findByCharacterId(
    characterId: string,
    userToken: UserPublic
  ): Promise<QuestEntity[]> {
    const character = await this.characterRepo.findByUserId(userToken.id);
    if (!character || characterId !== character.id) {
      throw new ForbiddenError(
        "You are not allowed to get this character quests"
      );
    }
    const quests = await this.repo.findByCharacterId(characterId);
    return quests;
  }

  public async findById(
    questId: string,
    userToken: UserPublic
  ): Promise<QuestEntity> {
    const character = await this.characterRepo.findById(userToken.id);
    if (!character) {
      throw new ForbiddenError(
        "You are not allowed to get this character quests"
      );
    }
    const quest = await this.repo.findById(questId);
    if (!quest) {
      throw new NotFoundError("Character not found", {
        details: { questId },
      });
    }
    if (character.id !== quest.characterId) {
      throw new ForbiddenError("You are not allowed to get this quest");
    }
    return quest;
  }
}
