import type { FastifyReply, FastifyRequest } from "fastify";
import type { ActivityService } from "./activity.service";
import { assertValidUUID } from "../../utils/validators/uuid-validator";
import { dateRangeQuerySchema } from "../../utils/validators/date-range-validator";

export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  public async findAll(req: FastifyRequest, reply: FastifyReply) {
    const { startAt, endAt } = req.query as { startAt?: Date; endAt?: Date };
    const authUser = req.user!;
    const dateRangeResult = dateRangeQuerySchema.safeParse({ startAt, endAt });
    if (!dateRangeResult.success) {
      return reply.status(400).send(dateRangeResult.error);
    }
    const activities = await this.service.getActivitiesBetweenDates(
      dateRangeResult.data,
      authUser
    );
    return reply.status(200).send(activities);
  }

  public async findById(req: FastifyRequest, reply: FastifyReply) {
    const { activityId } = req.params as { activityId: string };
    const authUser = req.user!;
    assertValidUUID(activityId, "activityId");
    const activity = await this.service.findById(activityId, authUser);
    return reply.status(200).send(activity);
  }

  public async complete(req: FastifyRequest, reply: FastifyReply) {
    const { activityId } = req.params as { activityId: string };
    const authUser = req.user!;
    assertValidUUID(activityId, "activityId");
    const activity = await this.service.complete(activityId, authUser);
    return reply.status(200).send(activity);
  }
}
