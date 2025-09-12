import type { FastifyInstance } from "fastify";
import { makeUserController } from "../modules/users/user.factory";
import { zodValidator } from "../utils/guards/zod-validator";
import {
  createUserSchema,
  updateUserSchema,
} from "../modules/users/user.entity";

const userController = makeUserController();

export async function userRoutes(app: FastifyInstance) {
  app.get("/", async (_req, reply) => {
    await userController.findMany(reply);
  });

  app.get("/:userId", async (req, reply) => {
    await userController.findById(req, reply);
  });

  app.post(
    "/",
    { preHandler: [zodValidator({ body: createUserSchema })] },
    async (req, reply) => {
      await userController.register(req, reply);
    }
  );

  app.put(
    "/:userId",
    {
      preHandler: [zodValidator({ body: updateUserSchema })],
    },
    async (req, reply) => {
      await userController.update(req, reply);
    }
  );

  app.delete("/:userId", async (req, reply) => {
    await userController.delete(req, reply);
  });
}
