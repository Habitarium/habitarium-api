import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

// Criamos uma função que recebe a instância do Fastify (app)
export const setupSwagger = async (app: FastifyInstance) => {
  // Registra o core do Swagger
  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Habitarium API",
        description: "Documentação da API para o app Habitarium.",
        version: "1.0.0",
      },
      // outras configurações globais aqui
    },
  });

  // Registra a UI (a página da documentação)
  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs", // A rota onde a documentação ficará acessível
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
  });

  console.log("Swagger UI disponível em /docs");
};
