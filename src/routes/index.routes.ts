import type { FastifyInstance } from "fastify";
import { userRoutes } from "./user.routes";
import { authRoutes } from "./auth.routes";
import { verifyAuth } from "../utils/hooks/verify-auth";
import { characterRoutes } from "./character.routes";

export async function registerRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: "/auth" });

  await app.register(async (privateApp) => {
    privateApp.addHook("preHandler", verifyAuth);
    privateApp.register(userRoutes, { prefix: "/users" });
    privateApp.register(characterRoutes, { prefix: "/characters" });
  });
}
