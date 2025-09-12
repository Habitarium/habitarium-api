import type { FastifyInstance } from "fastify";
import { zodValidator } from "../utils/guards/zod-validator";
import { createUserSchema } from "../modules/users/user.entity";
import { makeAuthController } from "../modules/auth/auth.factory";

const authController = makeAuthController();

export async function authRoutes(app: FastifyInstance) {
  app.post("/sign-in", async (req, reply) => {
    await authController.signIn(req, reply);
  });

  app.post(
    "/sign-up",
    { preHandler: [zodValidator({ body: createUserSchema })] },
    async (req, reply) => {
      await authController.signUp(req, reply);
    }
  );

  app.post("/verify-token", async (req, reply) => {
    await authController.verifyToken(req, reply);
  });
}
