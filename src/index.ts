import Fastify from "fastify";
import { registerRoutes } from "./routes";
import { fastifyErrorHandler } from "./utils/errors";

async function main() {
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST ?? "0.0.0.0";

  const app = Fastify({ logger: true });

  app.setErrorHandler(fastifyErrorHandler);

  await app.register(registerRoutes, { prefix: "/api" });

  await app.ready();
  app.log.info(app.printRoutes());

  try {
    await app.listen({ port, host });
    app.log.info(`HTTP server on http://${host}:${port}`);
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
