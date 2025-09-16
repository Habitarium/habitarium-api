import {
  ConflictError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/error-handler";
import type { UserPublic } from "../users/user.entity";
import type { CharacterEntity, UpdateCharacterInput } from "./character.entity";
import type { CharacterRepository } from "./character.repository";

export class CharacterService {
  constructor(private readonly repo: CharacterRepository) {}

  private getRequiredXp(level: number): number {
    return Math.floor(50 * Math.pow(level, 1.5));
  }

  public async findAll(): Promise<CharacterEntity[]> {
    const characters = await this.repo.findAll();
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

  public async findByUserId(userId: string): Promise<CharacterEntity> {
    const character = await this.repo.findByUserId(userId);
    if (!character) {
      throw new NotFoundError("Character not found", {
        details: { userId },
      });
    }
    return character;
  }

  public async addExperienceCharacter(
    xp: number,
    authUser: UserPublic
  ): Promise<CharacterEntity> {
    const found = await this.findByUserId(authUser.id);

    const accumulatedXp = found.totalXp + xp;
    let newLevel = found.level;

    while (accumulatedXp >= this.getRequiredXp(newLevel + 1)) {
      newLevel++;
    }

    const updatedCharacter: CharacterEntity = {
      ...found,
      totalXp: accumulatedXp,
      updatedAt: new Date(),
      level: newLevel,
    };

    const updated = await this.repo.update(updatedCharacter);
    if (!updated) {
      throw new DatabaseError("Failed to persist character update");
    }

    return updated;
  }

  public async create(user: UserPublic): Promise<CharacterEntity> {
    const existingCharacter = await this.repo.findByUserId(user.id);

    if (existingCharacter) {
      throw new ConflictError("UserId is already registered");
    }

    const allCharacters = await this.repo.findAll();

    const newCharacter: CharacterEntity = {
      id: crypto.randomUUID(),
      avatar: "INITIAL",
      nickname: user.name,
      currentQuestlineKey: "INITIAL",
      lastQuestCompletedAt: new Date(),
      level: 0,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      rankingPosition: allCharacters.length + 1,
      badges: [],
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.repo.create(newCharacter);
    if (!created) {
      throw new DatabaseError("Failed to persist character create");
    }

    return created;
  }

  public async delete(
    characterId: string,
    authUser: UserPublic
  ): Promise<void> {
    const character = await this.findById(characterId);

    if (character.userId !== authUser.id) {
      throw new ForbiddenError("You are not allowed to delete this character");
    }

    const deleted = await this.repo.delete(characterId);
    if (!deleted) {
      throw new DatabaseError("Failed to persist character delete");
    }

    return;
  }

  public async update(
    characterId: string,
    data: UpdateCharacterInput,
    authUser: UserPublic
  ): Promise<CharacterEntity> {
    const character = await this.repo.findById(characterId);
    if (!character) {
      throw new NotFoundError("Character not found");
    }

    if (character.userId !== authUser.id) {
      throw new ForbiddenError("You are not allowed to update this character");
    }

    const updatedCharacter: CharacterEntity = {
      ...character,
      avatar: data.avatar ?? character.avatar,
    };

    const updated = await this.repo.update(updatedCharacter);
    if (!updated) {
      throw new DatabaseError("Failed to persist character update");
    }

    return updated;
  }
}
