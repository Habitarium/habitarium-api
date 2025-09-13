import Fastify from "fastify";
import { registerRoutes } from "./routes/index.routes";
import { fastifyErrorHandler } from "./utils/error-handler";
import cors from "@fastify/cors";

async function main() {
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST ?? "0.0.0.0";

  const app = Fastify();

  // Registre o plugin de CORS aqui, antes das rotas
  // Isso permite que o backend receba requisições de diferentes origens.
  await app.register(cors, {
    origin: "http://localhost:5173",
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
