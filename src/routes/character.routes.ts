import type { FastifyInstance } from "fastify";
import { zodValidator } from "../utils/hooks/zod-validator";
import { updateCharacterSchema } from "../modules/characters/character.entity";
import { makeCharacterController } from "../modules/characters/character.factory";

const characterController = makeCharacterController();

export async function characterRoutes(app: FastifyInstance) {
  app.get("/me", async (req, reply) => {
    await characterController.findMe(req, reply);
  });

  app.get("/me/lessons-progress", async (req, reply) => {
    await characterController.findLessonProgress(req, reply);
  });

  app.get("/user/:userId", async (req, reply) => {
    await characterController.findByUserId(req, reply);
  });

  app.get("/:characterId", async (req, reply) => {
    await characterController.findById(req, reply);
  });

  app.put(
    "/:characterId",
    {
      preHandler: [zodValidator(updateCharacterSchema)],
    },
    async (req, reply) => {
      await characterController.update(req, reply);
    }
  );
}
