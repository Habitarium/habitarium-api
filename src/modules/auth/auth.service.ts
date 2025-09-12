import { signAccess, verifyAccess } from "../../utils/auth/token";
import { AuthRequiredError, NotFoundError } from "../../utils/errors";
import type { CreateUserInput } from "../users/user.entity";
import type { UserRepository } from "../users/user.repository";
import type { UserService } from "../users/user.service";
import type { AuthResponse, SignInInput } from "./auth.entity";

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService
  ) {}

  public async signUp(data: CreateUserInput): Promise<AuthResponse> {
    const user = await this.userService.register(data);
    const accessToken = signAccess(user);
    return { accessToken, user };
  }

  public async signIn(data: SignInInput): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new NotFoundError("User not found", {
        details: { email: data.email },
      });
    }
    const accessToken = signAccess(user);
    return { accessToken, user };
  }

  public verifyToken(token: string): void {
    const verifyToken = verifyAccess(token);
    if (!verifyToken) {
      throw new AuthRequiredError();
    }
    return;
  }
}
