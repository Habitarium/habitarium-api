import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserService } from "./user.service";
import type { UpdateUserInput } from "./user.entity";
import { assertValidUUID } from "../../utils/validators/uuid-validator";

export class UserController {
  constructor(private readonly service: UserService) {}

  public async findMe(req: FastifyRequest, reply: FastifyReply) {
    const authUser = req.user!;
    const user = await this.service.findById(authUser.id, authUser);
    return reply.status(200).send(user);
  }

  public async findById(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const authUser = req.user!;
    const user = await this.service.findById(userId, authUser);
    return reply.status(200).send(user);
  }

  public async update(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const data = req.body as UpdateUserInput;
    const authUser = req.user!;
    const user = await this.service.update(userId, data, authUser);
    return reply.status(200).send(user);
  }

  public async delete(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const authUser = req.user!;
    await this.service.delete(userId, authUser);
    return reply.status(204).send();
  }
}
