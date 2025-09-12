import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateUserInput } from "../users/user.entity";
import type { AuthResponse, SignInInput } from "./auth.entity";
import type { AuthService } from "./auth.service";
import { AuthRequiredError } from "../../utils/error-handler";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  public async signUp(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<AuthResponse> {
    const data = req.body as CreateUserInput;
    const auth = await this.service.signUp(data);
    return reply.status(200).send(auth);
  }

  public async signIn(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<AuthResponse> {
    const data = req.body as SignInInput;
    const auth = await this.service.signIn(data);
    return reply.status(200).send(auth);
  }

  public verifyToken(req: FastifyRequest, reply: FastifyReply) {
    const token = req.headers.authorization?.split(" ")[1] as string;
    if (!token) {
      throw new AuthRequiredError();
    }
    this.service.verifyToken(token);
    return reply.status(200).send();
  }
}
