/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  BAD_REQUEST: "BAD_REQUEST",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  BAD_GATEWAY: "BAD_GATEWAY",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export type Issue = {
  path?: string;
  message: string;
  rule?: string;
};

export type AppErrorOptions = {
  statusCode?: number;
  code?: ErrorCode;
  details?: unknown;
  cause?: unknown;
  exposeCause?: boolean;
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly cause?: unknown;

  constructor(message: string, opts: AppErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.statusCode = opts.statusCode ?? 500;
    this.code = opts.code ?? ErrorCodes.INTERNAL_ERROR;
    this.details = opts.details;
    this.cause = opts.cause;

    if (Error.captureStackTrace) Error.captureStackTrace(this, new.target);
  }

  toJSON(includeStack = false, includeCause = false) {
    const base: Record<string, any> = {
      name: this.name,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      details: this.details,
    };

    if (includeCause && this.cause instanceof Error) {
      base.cause = {
        name: this.cause.name,
        message: this.cause.message,
      };
    }

    if (includeStack) base.stack = this.stack;
    return base;
  }

  static isAppError(err: unknown): err is AppError {
    return err instanceof AppError;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", opts: AppErrorOptions = {}) {
    super(message, { statusCode: 400, code: ErrorCodes.BAD_REQUEST, ...opts });
  }
}

export class AuthRequiredError extends AppError {
  constructor(message = "Authentication required", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 401,
      code: ErrorCodes.AUTH_REQUIRED,
      ...opts,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", opts: AppErrorOptions = {}) {
    super(message, { statusCode: 403, code: ErrorCodes.FORBIDDEN, ...opts });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", opts: AppErrorOptions = {}) {
    super(message, { statusCode: 404, code: ErrorCodes.NOT_FOUND, ...opts });
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(message = "Method not allowed", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 405,
      code: ErrorCodes.METHOD_NOT_ALLOWED,
      ...opts,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", opts: AppErrorOptions = {}) {
    super(message, { statusCode: 409, code: ErrorCodes.CONFLICT, ...opts });
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Unsupported media type", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 415,
      code: ErrorCodes.UNSUPPORTED_MEDIA_TYPE,
      ...opts,
    });
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Payload too large", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 413,
      code: ErrorCodes.PAYLOAD_TOO_LARGE,
      ...opts,
    });
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable entity", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 422,
      code: ErrorCodes.UNPROCESSABLE_ENTITY,
      ...opts,
    });
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests", opts: AppErrorOptions = {}) {
    super(message, { statusCode: 429, code: ErrorCodes.RATE_LIMITED, ...opts });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 502,
      code: ErrorCodes.EXTERNAL_SERVICE_ERROR,
      ...opts,
    });
  }
}

export class BadGatewayError extends AppError {
  constructor(message = "Bad gateway", opts: AppErrorOptions = {}) {
    super(message, { statusCode: 502, code: ErrorCodes.BAD_GATEWAY, ...opts });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 503,
      code: ErrorCodes.SERVICE_UNAVAILABLE,
      ...opts,
    });
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = "Gateway timeout", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 504,
      code: ErrorCodes.GATEWAY_TIMEOUT,
      ...opts,
    });
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 500,
      code: ErrorCodes.INTERNAL_ERROR,
      ...opts,
    });
  }
}

export function zodIssues(zerr: ZodError): Issue[] {
  return zerr.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
    rule: i.code,
  }));
}

export class ValidationError extends BadRequestError {
  constructor(
    message = "Validation failed",
    opts: AppErrorOptions & { issues?: Issue[] } = {}
  ) {
    super(message, {
      ...opts,
      code: ErrorCodes.VALIDATION_ERROR,
      statusCode: 400,
    });
    if (opts.issues)
      (this as any).details = {
        ...(this.details as object),
        issues: opts.issues,
      };
  }

  static fromZod(zerr: ZodError, message = "Validation failed") {
    return new ValidationError(message, {
      details: { issues: zodIssues(zerr) },
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error", opts: AppErrorOptions = {}) {
    super(message, {
      statusCode: 500,
      code: ErrorCodes.DATABASE_ERROR,
      ...opts,
    });
  }

  static fromUnknown(
    err: unknown,
    fallbackMessage = "Database error"
  ): AppError {
    const anyErr = err as any;
    if (anyErr?.code === "23505") {
      return new ConflictError("Unique constraint violated", { cause: err });
    }
    return new DatabaseError(fallbackMessage, { cause: err });
  }
}

export function toAppError(err: unknown, fallback?: string): AppError {
  if (AppError.isAppError(err)) return err;

  if (err instanceof ZodError) return ValidationError.fromZod(err);

  const msg = (err as any)?.message as string | undefined;

  if (msg?.toLowerCase().includes("timeout")) {
    return new GatewayTimeoutError("Upstream timeout", { cause: err });
  }

  if ((err as any)?.code === "23505") {
    return new ConflictError("Unique constraint violated", { cause: err });
  }

  return new InternalError(fallback ?? "Internal server error", { cause: err });
}

export function serializeError(
  err: AppError | unknown,
  opts?: { includeStack?: boolean; includeCause?: boolean }
) {
  const appErr = toAppError(err);
  return appErr.toJSON(
    opts?.includeStack ?? false,
    opts?.includeCause ?? false
  );
}

export function sendError(reply: import("fastify").FastifyReply, err: unknown) {
  const appErr = toAppError(err);
  return reply
    .code(appErr.statusCode)
    .type("application/json")
    .send(serializeError(appErr));
}

export function fastifyErrorHandler(
  err: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply
) {
  req.log.error({ err }, "Unhandled error");
  console.error(err);
  return sendError(reply, err);
}
