import { z } from "zod";
import { ValidationError } from "./errors";

const idSchema = z.uuid();

export function isValidUUID(id: string): boolean {
  const result = idSchema.safeParse(id);
  return result.success;
}

export function assertValidUUID(id: string, resource = "UUID"): void {
  const result = idSchema.safeParse(id);
  if (!result.success) {
    throw new ValidationError(`Invalid ${resource}`);
  }
}
