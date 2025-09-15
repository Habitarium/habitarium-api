import type { FastifyRequest, FastifyReply } from "fastify";
import { assertValidUUID } from "../../utils/validators/uuid-validator";
import type { CharacterService } from "./character.service";
import type { UpdateCharacterInput } from "./character.entity";

export class CharacterController {
  constructor(private readonly service: CharacterService) {}

  public async findById(req: FastifyRequest, reply: FastifyReply) {
    const { characterId } = req.params as { characterId: string };
    assertValidUUID(characterId, "characterId");
    const character = await this.service.findById(characterId);
    return reply.status(200).send(character);
  }

  public async findByUserId(req: FastifyRequest, reply: FastifyReply) {
    const { userId } = req.params as { userId: string };
    assertValidUUID(userId, "userId");
    const character = await this.service.findByUserId(userId);
    return reply.status(200).send(character);
  }

  public async findMe(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.user!;
    const character = await this.service.findByUserId(id);
    return reply.status(200).send(character);
  }

  public async update(req: FastifyRequest, reply: FastifyReply) {
    const { characterId } = req.params as { characterId: string };
    assertValidUUID(characterId, "characterId");
    const authUser = req.user!;
    const data = req.body as UpdateCharacterInput;
    const user = await this.service.update(characterId, data, authUser);
    return reply.status(200).send(user);
  }

  public async delete(req: FastifyRequest, reply: FastifyReply) {
    const { characterId } = req.params as { characterId: string };
    assertValidUUID(characterId, "characterId");
    const authUser = req.user!;
    await this.service.delete(characterId, authUser);
    return reply.status(204).send();
  }
}
