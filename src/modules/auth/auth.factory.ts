import { db } from "../../db";
import { UserRepository } from "../users/user.repository";
import { UserService } from "../users/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

export function makeAuthController() {
  const userRepo = new UserRepository(db);
  const userService = new UserService(userRepo);
  const service = new AuthService(userRepo, userService);
  return new AuthController(service);
}
