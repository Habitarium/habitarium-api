import {
  ConflictError,
  InternalError,
  NotFoundError,
} from "../../utils/error-handler";
import type { UserPublic } from "../users/user.entity";
import type { CharacterEntity } from "./character.entity";
import type { CharacterRepository } from "./character.repository";

export class CharacterService {
  constructor(private readonly repo: CharacterRepository) {}

  public async findMany(): Promise<CharacterEntity[]> {
    const characters = await this.repo.findMany();
    return characters;
  }

  public async findById(characterId: string): Promise<CharacterEntity> {
    const character = await this.repo.findById(characterId);
    if (!character) {
      throw new NotFoundError("Character not found", {
        details: { characterId },
      });
    }
    return character;
  }

  public async create(
    data: { profilePictureUrl: string },
    user: UserPublic
  ): Promise<CharacterEntity> {
    const existingCharacter = await this.repo.findByUserId(user.id);

    if (existingCharacter) {
      throw new ConflictError("UserId is already registered");
    }

    const characters = await this.repo.findMany();

    const character: CharacterEntity = {
      id: crypto.randomUUID(),
      profilePictureUrl: data.profilePictureUrl,
      currentQuestlineKey: "INITIAL",
      lastQuestCompletedAt: new Date(),
      level: 0,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      rankingPosition: characters.length + 1,
      badges: [],
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdCharacter = await this.repo.create(character);

    if (!createdCharacter) {
      throw new InternalError("Failed to create character");
    }

    return createdCharacter;
  }

  public async delete(characterId: string): Promise<void> {
    const existingCharacter = await this.repo.findById(characterId);
    if (!existingCharacter) {
      throw new NotFoundError("Character not found");
    }
    const characterDeleted = await this.repo.delete(characterId);
    if (!characterDeleted) {
      throw new NotFoundError("Character not found");
    }
    return;
  }
}
