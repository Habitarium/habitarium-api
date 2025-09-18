import type { SignOptions, VerifyOptions } from "jsonwebtoken";

export const authConfig = {
  alg: "HS256" as const,
  accessTtl: "24h" as const,
  refreshTlf: "30d" as const,
  iss: "my-app",
  aud: "my-app-web",
  secret: process.env.JWT_SECRET as string,
  refreshSecret: process.env.REFRESH_TOKEN_SECRET as string,
};

export const signOpts: SignOptions = {
  algorithm: authConfig.alg,
  expiresIn: authConfig.accessTtl,
  issuer: authConfig.iss,
  audience: authConfig.aud,
};

export const signOptsRefresh: SignOptions = {
  algorithm: authConfig.alg,
  expiresIn: authConfig.refreshTlf,
  issuer: authConfig.iss,
  audience: authConfig.aud,
};

export const verifyOpts: VerifyOptions = {
  algorithms: [authConfig.alg],
  issuer: authConfig.iss,
  audience: authConfig.aud,
  clockTolerance: 5,
};
