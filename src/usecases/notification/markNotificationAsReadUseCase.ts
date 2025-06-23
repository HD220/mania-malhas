import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { SelectNotification, selectNotificationSchema } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";
import { NotFoundError, ForbiddenError } from "@/lib/errors/domainErrors";

export const markNotificationAsReadInputSchema = z.object({
  notificationId: z.string().uuid("ID da notificação inválido."),
  userId: z.string().uuid("ID do usuário inválido."), // To ensure user owns the notification
});

export type MarkNotificationAsReadInput = z.infer<typeof markNotificationAsReadInputSchema>;

export class MarkNotificationAsReadUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(input: MarkNotificationAsReadInput): Promise<SelectNotification> {
    const validationResult = markNotificationAsReadInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ZodError(validationResult.error.issues);
    }

    const { notificationId, userId } = validationResult.data;

    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundError("Notificação");
    }

    if (notification.userId !== userId) {
      throw new ForbiddenError("Você não tem permissão para marcar esta notificação como lida.");
    }

    // If already read, we can return it directly to avoid an unnecessary update.
    if (notification.isRead) {
      return selectNotificationSchema.parse(notification);
    }

    const updatedNotification = await this.notificationRepository.markAsRead(notificationId);

    return selectNotificationSchema.parse(updatedNotification);
  }
}
