import type { FastifyReply, FastifyRequest } from "fastify";
import type { QuestService } from "./quest.service";
import type { CreateQuestInput, UpdateQuestInput } from "./quest.entity";

export class QuestController {
  constructor(private readonly service: QuestService) {}

  public async findQuestsByCharacter(req: FastifyRequest, reply: FastifyReply) {
    const authUser = req.user!;
    const quests = await this.service.findQuestsByCharacter(authUser);
    return reply.status(200).send(quests);
  }

  public async findById(req: FastifyRequest, reply: FastifyReply) {
    const { questId } = req.params as { questId: string };
    const authUser = req.user!;
    const quest = await this.service.findById(questId, authUser);
    return reply.status(200).send(quest);
  }

  public async findByParentId(req: FastifyRequest, reply: FastifyReply) {
    const { questId } = req.params as { questId: string };
    const authUser = req.user!;
    const quest = await this.service.findByParentId(questId, authUser);
    return reply.status(200).send(quest);
  }

  public async create(req: FastifyRequest, reply: FastifyReply) {
    const data = req.body as CreateQuestInput;
    const authUser = req.user!;
    const quest = await this.service.create(data, authUser);
    return reply.status(201).send(quest);
  }

  public async update(req: FastifyRequest, reply: FastifyReply) {
    const { questId } = req.params as { questId: string };
    const data = req.body as UpdateQuestInput;
    const authUser = req.user!;
    const quest = await this.service.update(questId, data, authUser);
    return reply.status(200).send(quest);
  }

  public async delete(req: FastifyRequest, reply: FastifyReply) {
    const { questId } = req.params as { questId: string };
    const authUser = req.user!;
    await this.service.delete(questId, authUser);
    return reply.status(204).send();
  }

  public async findQuestsByQuestline(
    _req: FastifyRequest,
    reply: FastifyReply,
  ) {
    const questlines = await this.service.findQuestlinesWithLessons();
    return reply.status(200).send(questlines);
  }

  public async findLessonById(req: FastifyRequest, reply: FastifyReply) {
    const { lessonId } = req.params as { lessonId: string };
    const lessonContent = await this.service.findLessonById(lessonId);
    return reply.status(200).send(lessonContent);
  }
}
