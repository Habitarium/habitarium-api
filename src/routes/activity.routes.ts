import type { FastifyInstance } from "fastify/types/instance";
import { makeActivityController } from "../modules/activities/activity.factory";

const activityController = makeActivityController();

export async function activityRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    await activityController.findAll(req, reply);
  });

  app.get("/:activityId", async (req, reply) => {
    await activityController.findById(req, reply);
  });

  app.post("/complete/:activityId", async (req, reply) => {
    await activityController.complete(req, reply);
  });
}
