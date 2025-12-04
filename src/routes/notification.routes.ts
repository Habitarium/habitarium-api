import type { FastifyInstance } from "fastify";
import { zodValidator } from "../utils/hooks/zod-validator";
import { makeNotificationController } from "../modules/notifications/notification.factory";
import { updateNotificationSchema } from "../modules/notifications/notification.entity";

const notificationController = makeNotificationController();

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    await notificationController.findAll(req, reply);
  });

  app.put(
    "/:notificationId",
    {
      preHandler: [zodValidator(updateNotificationSchema)],
    },
    async (req, reply) => {
      await notificationController.update(req, reply);
    },
  );
}
