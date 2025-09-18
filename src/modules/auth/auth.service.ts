import { comparePassword } from "../../utils/auth/hash-password";
import { signAccess, verifyAccess } from "../../utils/auth/jwt";
import { AuthRequiredError } from "../../utils/error-handler";
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
    const createdUser = await this.userService.create(data);
    const accessToken = signAccess(createdUser.user);
    const refreshToken = signAccess(createdUser.user);
    return { accessToken, refreshToken, user: createdUser.user };
  }

  public async signIn(data: SignInInput): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user) {
      throw new AuthRequiredError("Invalid credentials");
    }
    const ok = await comparePassword(data.password, user.passwordHash);
    if (!ok) {
      throw new AuthRequiredError("Invalid credentials");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    const accessToken = signAccess(safeUser);
    const refreshToken = signAccess(safeUser);
    return { accessToken, refreshToken, user: safeUser };
  }

  public verifyToken(token: string): void {
    const verifyToken = verifyAccess(token);
    if (!verifyToken) {
      throw new AuthRequiredError();
    }
    return;
  }
}
