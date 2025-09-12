import type { UserPublic } from "../../modules/users/user.entity";
import { AuthRequiredError } from "../error-handler";
import { verifyAccess } from "../auth/jwt";
import type {
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: UserPublic;
  }
}

export function verifyAuth(
  req: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  try {
    const bearerToken = req.headers.authorization?.split(" ")[1];
    if (!bearerToken) throw new AuthRequiredError();

    const payload = verifyAccess(bearerToken);
    if (!payload) throw new AuthRequiredError();

    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    };
    done();
  } catch {
    throw new AuthRequiredError();
  }
}
