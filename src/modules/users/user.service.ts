import { hashPassword } from "../../utils/auth/hash-password";
import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  UnprocessableEntityError,
} from "../../utils/error-handler";
import type { CharacterService } from "../characters/character.service";
import type {
  CreatedUser,
  CreateUserInput,
  UpdateUserInput,
  UserEntity,
  UserPublic,
} from "./user.entity";
import type { UserRepository } from "./user.repository";

export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly characterService: CharacterService
  ) {}

  public async findById(
    userId: string,
    userToken: UserPublic
  ): Promise<UserPublic> {
    if (userId !== userToken.id) {
      throw new ForbiddenError("You are not allowed to get this user");
    }
    const user = await this.repo.findPublicById(userId);
    if (!user) {
      throw new NotFoundError("User not found", { details: { userId } });
    }
    return user;
  }

  public async create(data: CreateUserInput): Promise<CreatedUser> {
    const existingUser = await this.repo.findByEmail(data.email);
    if (existingUser) {
      throw new UnprocessableEntityError("Unable to process registration");
    }

    const passwordHash = await hashPassword(data.password);
    const newUser: UserEntity = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.repo.create(newUser);
    if (!created) {
      throw new InternalError("Failed to create user");
    }

    const character = await this.characterService.create(created);

    if (!character) {
      throw new InternalError("Failed to character");
    }

    return { user: created, character: character };
  }

  public async update(
    userId: string,
    data: UpdateUserInput,
    userToken: UserPublic
  ): Promise<UserPublic> {
    if (userId !== userToken.id) {
      throw new ForbiddenError("You are not allowed to update this user");
    }
    const foundUser = await this.repo.findById(userId);
    if (!foundUser) {
      throw new NotFoundError("User not found", { details: { id: userId } });
    }

    if (data.email && data.email !== foundUser.email) {
      const existingUser = await this.repo.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("Email is already registered", {
          details: { email: data.email },
        });
      }
    }

    let newPasswordHash = foundUser.passwordHash;
    if (data.password) {
      newPasswordHash = await hashPassword(data.password);
      delete data.password;
    }

    const updatedUser: UserEntity = {
      ...foundUser,
      ...data,
      id: userId,
      passwordHash: newPasswordHash,
      createdAt: foundUser.createdAt,
      updatedAt: new Date(),
    };

    const updated = await this.repo.update(updatedUser);
    if (!updated) {
      throw new InternalError("Failed to update user");
    }
    return updated;
  }

  public async delete(userId: string, userToken: UserPublic): Promise<void> {
    if (userId !== userToken.id) {
      throw new ForbiddenError("You are not allowed to delete this user");
    }

    const existingUser = await this.repo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    const deleted = await this.repo.delete(userId);
    if (!deleted) {
      throw new NotFoundError("User not found");
    }
    return;
  }
}
