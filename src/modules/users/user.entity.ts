import type { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import type { users } from "../../db/schemas/users";
import type { CharacterEntity } from "../characters/character.entity";

export const createUserSchema = z
  .object({
    name: z.string("Name is required").trim().min(1, "Name is required"),
    email: z.email("Invalid email"),
    password: z
      .string("Password is required")
      .min(6, "Password must be at least 6 characters"),
  })
  .strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z
      .string("Name is required")
      .trim()
      .min(1, "Name is required")
      .optional(),
    email: z.email("Invalid email").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type UserEntity = InferSelectModel<typeof users>;

export type UserPublic = Omit<UserEntity, "passwordHash">;

export type CreatedUser = {
  user: UserPublic;
  character: CharacterEntity;
};
