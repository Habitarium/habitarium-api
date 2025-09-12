/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";

type ZSchema = z.ZodType<any, any, any>;
type Schemas = {
  body?: ZSchema;
  query?: ZSchema;
  params?: ZSchema;
  headers?: ZSchema;
};

type InferValidated<S extends Schemas> = {
  Body: S["body"] extends ZSchema ? z.infer<NonNullable<S["body"]>> : unknown;
  Querystring: S["query"] extends ZSchema
    ? z.infer<NonNullable<S["query"]>>
    : unknown;
  Params: S["params"] extends ZSchema
    ? z.infer<NonNullable<S["params"]>>
    : unknown;
  Headers: S["headers"] extends ZSchema
    ? z.infer<NonNullable<S["headers"]>>
    : unknown;
};

const formatIssues = (err: z.ZodError) =>
  err.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

export function zodValidator<S extends Schemas>(schemas: S) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const fail = (err: z.ZodError) =>
      reply.status(400).send({
        errors: formatIssues(err),
      });

    if (schemas.body) {
      const r = schemas.body.safeParse(req.body);
      if (!r.success) return fail(r.error);
      req.body = r.data as any;
    }

    if (schemas.query) {
      const r = schemas.query.safeParse((req as any).query);
      if (!r.success) return fail(r.error);
      (req as any).query = r.data;
    }

    if (schemas.params) {
      const r = schemas.params.safeParse(req.params);
      if (!r.success) return fail(r.error);
      req.params = r.data as any;
    }

    if (schemas.headers) {
      const r = schemas.headers.safeParse(req.headers);
      if (!r.success) return fail(r.error);
      req.headers = r.data as any;
    }
  };
}

export type ValidatedRequest<S extends Schemas> = FastifyRequest & {
  body: InferValidated<S>["Body"];
  query: InferValidated<S>["Querystring"];
  params: InferValidated<S>["Params"];
  headers: InferValidated<S>["Headers"];
};
