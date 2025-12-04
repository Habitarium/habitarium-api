import { createClient } from "@supabase/supabase-js";
import { signAccess } from "../../utils/auth/jwt";
import { NotFoundError, AuthRequiredError } from "../../utils/error-handler";
import type { UserRepository } from "../users/user.repository";
import type { UserService } from "../users/user.service";
import type { UserEntity, UserPublic } from "../users/user.entity";

export interface SupabaseAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
  redirectUrl?: string;
}

export interface SupabaseLoginResponse {
  url: string;
}

export interface SupabaseCallbackData {
  code: string;
  state?: string;
}

export type SupportedProvider = "google" | "facebook" | "github";

export class SupabaseAuthService {
  private supabase: ReturnType<typeof createClient>;

  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService,
  ) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key must be provided");
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  public async getLoginUrl(
    provider: SupportedProvider,
  ): Promise<SupabaseLoginResponse> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.API_BASE_URL || "http://localhost:3000"}/auth/supabase/callback`,
      },
    });

    if (error) {
      throw new AuthRequiredError(`Supabase login error: ${error.message}`);
    }

    return { url: data.url || "" };
  }

  public async handleCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _callbackData: SupabaseCallbackData,
  ): Promise<SupabaseAuthResponse> {
    const { data, error } = await this.supabase.auth.getSession();

    if (error || !data.session) {
      throw new AuthRequiredError("Failed to get session from Supabase");
    }

    const supabaseUser = data.session.user;

    if (!supabaseUser.email) {
      throw new AuthRequiredError("No email found in Supabase user");
    }

    let user = await this.userRepo.findByEmail(supabaseUser.email);

    if (!user) {
      const provider = this.detectProviderFromMetadata(
        supabaseUser.user_metadata,
      );
      const newUser: UserEntity = {
        id: crypto.randomUUID(),
        name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email.split("@")[0],
        email: supabaseUser.email,
        provider,
        passwordHash: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = await this.userRepo.create(newUser);
      if (!created) {
        throw new Error("Failed to create user");
      }

      user = await this.userRepo.findById(created.id);
    } else {
      const provider = this.detectProviderFromMetadata(
        supabaseUser.user_metadata,
      );
      if (user.provider !== provider) {
        const updatedUser: UserEntity = {
          ...user,
          provider,
          updatedAt: new Date(),
        };

        const updated = await this.userRepo.update(updatedUser);
        if (!updated) {
          throw new Error("Failed to update user provider");
        }

        user = await this.userRepo.findById(updated.id);
      }
    }

    if (!user) {
      throw new Error("User not found after authentication");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    const accessToken = signAccess(safeUser);
    const refreshToken = signAccess(safeUser);

    return {
      accessToken,
      refreshToken,
      user: safeUser,
      redirectUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`,
    };
  }

  public async verifySupabaseToken(token: string): Promise<UserPublic> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AuthRequiredError("Invalid Supabase token");
    }

    const user = await this.userRepo.findByEmail(data.user.email!);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private detectProviderFromMetadata(
    metadata: Record<string, unknown>,
  ): "google" | "facebook" | "github" {
    if (metadata?.provider && typeof metadata.provider === "string") {
      const provider = metadata.provider.toLowerCase();
      if (
        provider === "google" ||
        provider === "facebook" ||
        provider === "github"
      ) {
        return provider;
      }
    }

    if (metadata?.avatar_url && typeof metadata.avatar_url === "string") {
      if (metadata.avatar_url.includes("googleusercontent.com")) {
        return "google";
      }
      if (metadata.avatar_url.includes("fbcdn.net")) {
        return "facebook";
      }
      if (metadata.avatar_url.includes("githubusercontent.com")) {
        return "github";
      }
    }

    return "google";
  }

  public async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
