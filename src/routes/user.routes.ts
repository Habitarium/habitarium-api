import type { FastifyInstance } from "fastify";
import { UserFactory } from "../modules/users/user.factory";
import { zodMiddleware } from "../shared/middleware/zod-validator";
import { createUserSchema } from "../modules/users/user.dto";
import z from "zod";

const userParamsValidator = z.object({
  id: z.uuid("id da requisição inválido").optional(),
});

export async function userRoutes(app: FastifyInstance) {
  app.post(
    "/:id",
    {
      preHandler: [
        zodMiddleware({ body: createUserSchema, params: userParamsValidator }),
      ],
    },
    UserFactory.findById
  );
}
