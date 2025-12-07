import Fastify from "fastify";
import { registerRoutes } from "./routes/index.routes";
import { fastifyErrorHandler } from "./utils/error-handler";
import cors from "@fastify/cors";

async function main() {
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST!;

  const app = Fastify();

  await app.register(cors, {
    origin: process.env.FRONT_HOST as string,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  app.setErrorHandler(fastifyErrorHandler);

  await app.register(registerRoutes, { prefix: "/api" });

  await app.ready();

  console.log(app.printRoutes());

  try {
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const close = async () => {
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

void main();
