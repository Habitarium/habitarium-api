import jwt, { type Jwt, type JwtPayload } from "jsonwebtoken";
import { authConfig, signOpts, verifyOpts } from "../../libs/auth-config";
import type { UserPublic } from "../../modules/users/user.entity";
import crypto from "crypto";

export function signAccess(data: UserPublic): string {
  return jwt.sign(data, authConfig.secret, {
    ...signOpts,
    subject: data.id,
    jwtid: crypto.randomUUID(),
  });
}

export function verifyAccess(token: string): string | Jwt | JwtPayload {
  const payload = jwt.verify(token, authConfig.secret, verifyOpts);
  if (typeof payload === "string") {
    throw new Error("Invalid JWT payload");
  }

  return payload;
}
