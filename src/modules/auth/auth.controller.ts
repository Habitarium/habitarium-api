import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateUserInput } from "../users/user.entity";
import type { AuthResponse, SignInInput } from "./auth.entity";
import type { AuthService } from "./auth.service";
import type {
  SupabaseAuthService,
  SupabaseAuthResponse,
  SupabaseLoginResponse,
  SupabaseCallbackData,
  SupportedProvider,
} from "./supabase-auth.service";
import { AuthRequiredError } from "../../utils/error-handler";

export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly supabaseService: SupabaseAuthService,
  ) {}

  public async signUp(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<AuthResponse> {
    const data = req.body as CreateUserInput;
    const auth = await this.service.signUp(data);
    return reply.status(201).send(auth);
  }

  public async signIn(
    req: FastifyRequest,
    reply: FastifyReply,
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

  public async supabaseLogin(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<SupabaseLoginResponse> {
    const { provider } = req.params as { provider: SupportedProvider };

    if (!provider || !["google", "facebook", "github"].includes(provider)) {
      throw new AuthRequiredError(
        "Provider must be google, facebook, or github",
      );
    }

    const response = await this.supabaseService.getLoginUrl(provider);
    return reply.status(200).send(response);
  }

  public async supabaseCallback(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<SupabaseAuthResponse> {
    const data = req.query as SupabaseCallbackData;
    const auth = await this.supabaseService.handleCallback(data);
    return reply.status(200).send(auth);
  }
}
