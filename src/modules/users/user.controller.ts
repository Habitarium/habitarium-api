import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserService } from "./user.service";
import type { CreateUserInput, UpdateUserInput } from "./user.entity";
import { assertValidUUID } from "../../utils/id-validator";

export class UserController {
  constructor(private readonly service: UserService) {}

  public async findMany(reply: FastifyReply) {
    const users = await this.service.findMany();
    return reply.status(200).send(users);
  }

  public async findById(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const user = await this.service.findById(userId);
    return reply.status(200).send(user);
  }

  public async register(req: FastifyRequest, reply: FastifyReply) {
    const data = req.body as CreateUserInput;
    const user = await this.service.register(data);
    return reply.status(200).send(user);
  }

  public async update(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const data = req.body as UpdateUserInput;
    const user = await this.service.update(userId, data);
    return reply.status(200).send(user);
  }

  public async delete(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    await this.service.delete(userId);
    return reply.status(204).send();
  }
}
