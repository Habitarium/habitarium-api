import type { FastifyInstance } from "fastify";
import { zodValidator } from "../utils/hooks/zod-validator";
import { createUserSchema } from "../modules/users/user.entity";
import { makeAuthController } from "../modules/auth/auth.factory";
import { signInSchema } from "../modules/auth/auth.entity";

const authController = makeAuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/sign-in",
    { preHandler: [zodValidator(signInSchema)] },
    async (req, reply) => {
      await authController.signIn(req, reply);
    },
  );

  app.post(
    "/sign-up",
    { preHandler: [zodValidator(createUserSchema)] },
    async (req, reply) => {
      await authController.signUp(req, reply);
    },
  );

  app.get("/verify-token", async (req, reply) => {
    await authController.verifyToken(req, reply);
  });

  app.get("/supabase/login/:provider", async (req, reply) => {
    await authController.supabaseLogin(req, reply);
  });

  app.get("/supabase/callback", async (req, reply) => {
    await authController.supabaseCallback(req, reply);
  });
}
