import jwt, { type JwtPayload } from "jsonwebtoken";
import { authConfig, signOpts, verifyOpts } from "../../libs/auth-config";
import type { UserPublic } from "../../modules/users/user.entity";
import crypto from "crypto";
import { AuthRequiredError } from "../error-handler";

export function signAccess(data: UserPublic): string {
  return jwt.sign(data, authConfig.secret, {
    ...signOpts,
    subject: data.id,
    jwtid: crypto.randomUUID(),
  });
}

export type accessPayload = JwtPayload & UserPublic;

export function verifyAccess(token: string): accessPayload {
  try {
    const payload = jwt.verify(token, authConfig.secret, verifyOpts);
    if (typeof payload === "string") {
      throw new AuthRequiredError();
    }
    return payload as accessPayload;
  } catch {
    throw new AuthRequiredError();
  }
}
