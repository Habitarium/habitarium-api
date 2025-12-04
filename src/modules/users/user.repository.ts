import { eq } from "drizzle-orm";
import type { Db } from "../../db";
import { users } from "../../db/schemas/users";
import type { UserEntity, UserPublic } from "./user.entity";

export class UserRepository {
  constructor(private readonly db: Db) {}

  public async findPublicById(userId: string): Promise<UserPublic | undefined> {
    const [result] = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        provider: users.provider,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId));
    return result;
  }

  public async findById(userId: string): Promise<UserEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    return result;
  }

  public async findByEmail(email: string): Promise<UserEntity | undefined> {
    const [result] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return result;
  }

  public async findByEmailPublic(
    email: string,
  ): Promise<UserPublic | undefined> {
    const [result] = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        provider: users.provider,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email));
    return result;
  }

  public async findAllPublic(): Promise<UserPublic[]> {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        provider: users.provider,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
    return result;
  }

  public async delete(userId: string): Promise<boolean> {
    const [result] = await this.db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    return !!result;
  }

  public async create(data: UserEntity): Promise<UserPublic | undefined> {
    const [result] = await this.db.insert(users).values(data).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      provider: users.provider,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
    return result;
  }

  public async update(data: UserEntity): Promise<UserPublic | undefined> {
    const [result] = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, data.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        provider: users.provider,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    return result;
  }
}
