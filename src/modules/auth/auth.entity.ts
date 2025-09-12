import z from "zod";
import type { UserPublic } from "../users/user.entity";

export const signUpSchema = z
  .object({
    email: z.email("Email inválido"),
    password: z
      .string("Senha deve ter no mínimo 6 caracteres")
      .min(6, "Senha deve ter no mínimo 6 caracteres"),
  })
  .strict();

export type SignInInput = z.infer<typeof signUpSchema>;

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: UserPublic;
};
