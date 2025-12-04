import type { FastifyInstance } from "fastify";
import { makeUserController } from "../modules/users/user.factory";
import { zodValidator } from "../utils/hooks/zod-validator";
import { updateUserSchema } from "../modules/users/user.entity";

const userController = makeUserController();

export async function userRoutes(app: FastifyInstance) {
  app.get("/me", async (req, reply) => {
    await userController.findMe(req, reply);
  });

  app.get("/:userId", async (req, reply) => {
    await userController.findById(req, reply);
  });

  app.put(
    "/me",
    {
      preHandler: [zodValidator(updateUserSchema)],
    },
    async (req, reply) => {
      await userController.update(req, reply);
    },
  );

  app.delete("/me", async (req, reply) => {
    await userController.delete(req, reply);
  });
}
