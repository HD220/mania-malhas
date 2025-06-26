import { z } from "zod";
import { NotificationRepository } from "@/features/notification/db/notification-repository";
import { SelectNotification, selectNotificationSchema } from "@/features/notification/schemas/notificationSchema";
import { ZodError } from "zod";
import { NotFoundError, ForbiddenError } from "@/lib/errors/domainErrors";

export const markNotificationAsReadInputSchema = z.object({
  notificationId: z.string().uuid("ID da notificação inválido."),
  userId: z.string().uuid("ID do usuário inválido."),
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

    if (notification.isRead) {
      return selectNotificationSchema.parse(notification);
    }

    // The repository's markAsRead method should ideally return the updated notification.
    // If it returns void, we'd need to call findById again.
    // Assuming it returns the updated notification or is changed to do so.
    // The current repo returns void. This use case needs to re-fetch.
    await this.notificationRepository.markAsRead(notificationId, userId); // Pass userId for ownership check in repo
    const updatedNotification = await this.notificationRepository.findById(notificationId);

    if (!updatedNotification) {
        // This should not happen if markAsRead was successful and didn't delete it.
        throw new Error("Falha ao buscar notificação após marcá-la como lida.");
    }

    return selectNotificationSchema.parse(updatedNotification);
  }
}
