import { hashPassword } from "../../utils/auth/password";
import {
  ConflictError,
  InternalError,
  NotFoundError,
} from "../../utils/errors";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserEntity,
  UserPublic,
} from "./user.entity";
import type { UserRepository } from "./user.repository";

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  public async findMany(): Promise<UserPublic[]> {
    return await this.repo.findAllPublic();
  }

  public async findById(id: string): Promise<UserPublic> {
    const user = await this.repo.findPublicById(id);
    if (!user) {
      throw new NotFoundError("User not found", { details: { id } });
    }
    return user;
  }

  public async register(data: CreateUserInput): Promise<UserPublic> {
    const existingUser = await this.repo.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("Email is already registered", {
        details: { email: data.email },
      });
    }

    const hashedPassword = await hashPassword(data.password);
    const newUserEntity: UserEntity = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdUser = await this.repo.create(newUserEntity);
    if (!createdUser) {
      throw new InternalError("Failed to create user");
    }
    return createdUser;
  }

  public async update(
    userId: string,
    input: UpdateUserInput
  ): Promise<UserPublic> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found", { details: { id: userId } });
    }

    if (input.email && input.email !== user.email) {
      const existingUser = await this.repo.findByEmail(input.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("Email is already registered", {
          details: { email: input.email },
        });
      }
    }

    let newPasswordHash = user.passwordHash;
    if (input.password) {
      newPasswordHash = await hashPassword(input.password);
      delete input.password;
    }

    const updatedEntity: UserEntity = {
      ...user,
      ...input,
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    };

    const updatedUser = await this.repo.update(userId, updatedEntity);
    if (!updatedUser) {
      throw new InternalError("Failed to update user");
    }
    return updatedUser;
  }

  public async delete(userId: string): Promise<void> {
    const existingUser = await this.repo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    const userDeleted = await this.repo.delete(userId);
    if (!userDeleted) {
      throw new NotFoundError("User not found");
    }
    return;
  }
}
