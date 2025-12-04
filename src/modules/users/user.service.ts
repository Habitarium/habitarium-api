import { hashPassword } from "../../utils/auth/hash-password";
import {
  ConflictError,
  DatabaseError,
  ForbiddenError,
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
    private readonly characterService: CharacterService,
  ) {}

  public async findById(
    userId: string,
    authUser: UserPublic,
  ): Promise<UserPublic> {
    if (userId !== authUser.id) {
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
      provider: "local",
      passwordHash: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.repo.create(newUser);
    if (!created) {
      throw new DatabaseError("Failed to persist user create");
    }

    const character = await this.characterService.create(created);

    return { user: created, character: character };
  }

  public async update(
    userId: string,
    data: UpdateUserInput,
    authUser: UserPublic,
  ): Promise<UserPublic> {
    if (userId !== authUser.id) {
      throw new ForbiddenError("You are not allowed to update this user");
    }

    const found = await this.repo.findById(userId);
    if (!found) {
      throw new NotFoundError("User not found", { details: { id: userId } });
    }

    if (data.email && data.email !== found.email) {
      const existingUser = await this.repo.findByEmail(data.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("Email is already registered", {
          details: { email: data.email },
        });
      }
    }

    let newPasswordHash = found.passwordHash;
    if (data.password) {
      newPasswordHash = await hashPassword(data.password);
      delete data.password;
    }

    const updatedUser: UserEntity = {
      ...found,
      ...data,
      id: userId,
      name: data.name ?? found.name,
      email: data.email ?? found.email,
      passwordHash: newPasswordHash,
      createdAt: found.createdAt,
      updatedAt: new Date(),
    };

    const updated = await this.repo.update(updatedUser);
    if (!updated) {
      throw new DatabaseError("Failed to persist user update");
    }

    return updated;
  }

  public async delete(userId: string, authUser: UserPublic): Promise<void> {
    if (userId !== authUser.id) {
      throw new ForbiddenError("You are not allowed to delete this user");
    }

    const existingUser = await this.repo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    const deleted = await this.repo.delete(userId);
    if (!deleted) {
      throw new DatabaseError("Failed to persist user delete");
    }

    return;
  }
}
