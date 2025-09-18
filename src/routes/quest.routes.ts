import type { FastifyInstance } from "fastify";
import { zodValidator } from "../utils/hooks/zod-validator";
import { makeQuestController } from "../modules/quests/quest.factory";
import {
  createQuestSchema,
  updateQuestSchema,
} from "../modules/quests/quest.entity";

const questController = makeQuestController();

export async function questRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    await questController.findQuestsByCharacter(req, reply);
  });

  app.get(
    "/questline",
    {
      config: {
        isPublic: true,
      },
    },
    async (req, reply) => {
      await questController.findQuestsByQuestline(req, reply);
    },
  );

  app.get(
    "/questline/:lessonId",
    {
      config: {
        isPublic: true,
      },
    },
    async (req, reply) => {
      await questController.findLessonById(req, reply);
    },
  );

  app.get("/parent/:questId", async (req, reply) => {
    await questController.findById(req, reply);
  });

  app.get("/:questId", async (req, reply) => {
    await questController.findById(req, reply);
  });

  app.post(
    "/",
    {
      preHandler: [zodValidator(createQuestSchema)],
    },
    async (req, reply) => {
      await questController.create(req, reply);
    }
  );

  app.put(
    "/:questId",
    {
      preHandler: [zodValidator(updateQuestSchema)],
    },
    async (req, reply) => {
      await questController.update(req, reply);
    }
  );

  app.delete("/:questId", async (req, reply) => {
    await questController.delete(req, reply);
  });
}
