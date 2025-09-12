import { z } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";

export function zodValidator<T extends z.ZodTypeAny>(schema: T) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      return reply.status(400).send(r.error);
    }
    req.body = r.data;
  };
}

export type ValidatedRequest<T extends z.ZodTypeAny> = FastifyRequest & {
  body: z.infer<T>;
};
