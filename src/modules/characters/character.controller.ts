import type { FastifyRequest, FastifyReply } from "fastify";
import { assertValidUUID } from "../../utils/validators/uuid-validator";
import type { CharacterService } from "./character.service";
import type { UpdateCharacterInput } from "./character.entity";
import type { UpdateLessonProgressInput } from "../lessons/lesson.entity";

export class CharacterController {
  constructor(private readonly service: CharacterService) {}

  public async getRanking(req: FastifyRequest, reply: FastifyReply) {
    const ranking = await this.service.getRanking();
    return reply.status(200).send(ranking);
  }

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

  public async findLessonProgress(req: FastifyRequest, reply: FastifyReply) {
    const authUser = req.user!;
    const progress = await this.service.findLessonProgress(authUser);
    return reply.status(200).send(progress);
  }

  public async updateLessonProgress(req: FastifyRequest, reply: FastifyReply) {
    const { lessonProgressId } = req.params as { lessonProgressId: string };
    assertValidUUID(lessonProgressId, "lessonProgressId");
    const authUser = req.user!;
    const { progress } = req.body as UpdateLessonProgressInput;
    const result = await this.service.updateLessonProgress(
      lessonProgressId,
      progress,
      authUser,
    );
    return reply.status(200).send(result);
  }

  public async completeLesson(req: FastifyRequest, reply: FastifyReply) {
    const { lessonId } = req.body as { lessonId: string };
    const authUser = req.user!;
    const result = await this.service.completeLesson(lessonId, authUser);
    return reply.status(200).send(result);
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
