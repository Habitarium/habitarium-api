import type { FastifyInstance } from "fastify";
import { userRoutes } from "./user.routes";
import { authRoutes } from "./auth.routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(userRoutes, { prefix: "/users" });
  await app.register(authRoutes, { prefix: "/auth" });
}
