import type { FastifyRequest, FastifyReply } from "fastify";
import type { NotificationService } from "./notification.service";
import type { UpdateNotificationInput } from "./notification.entity";

export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  public async findAll(req: FastifyRequest, reply: FastifyReply) {
    const authUser = req.user!;
    const notifications = await this.service.findAll(authUser);
    return reply.status(200).send(notifications);
  }

  public async update(req: FastifyRequest, reply: FastifyReply) {
    const { notificationId } = req.params as { notificationId: string };
    const data = req.body as UpdateNotificationInput;
    const authUser = req.user!;
    const notification = await this.service.update(
      notificationId,
      data,
      authUser,
    );
    return reply.status(200).send(notification);
  }
}
