import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserService } from "./user.service";
import type { UpdateUserInput } from "./user.entity";
import { assertValidUUID } from "../../utils/uuid-validator";

export class UserController {
  constructor(private readonly service: UserService) {}

  public async findMe(req: FastifyRequest, reply: FastifyReply) {
    const userToken = req.user!;
    const user = await this.service.findById(userToken.id, userToken);
    return reply.status(200).send(user);
  }

  public async findById(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const userToken = req.user!;
    const user = await this.service.findById(userId, userToken);
    return reply.status(200).send(user);
  }

  public async update(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const data = req.body as UpdateUserInput;
    const userToken = req.user!;
    const user = await this.service.update(userId, data, userToken);
    return reply.status(200).send(user);
  }

  public async delete(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const userToken = req.user!;
    await this.service.delete(userId, userToken);
    return reply.status(204).send();
  }
}
