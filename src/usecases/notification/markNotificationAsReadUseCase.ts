import { db } from "@/db/postgres";
import {
  notificationRepository as createNotificationRepository,
  NotificationRepositoryFactory,
} from "@/db/repositories/notificationRepository";
import { NotFoundError } from "@/lib/errors/domainErrors"; // Assuming AuthorizationError is not yet defined, will use Error for now or add later
import { z } from "zod";

export const markNotificationAsReadInputSchema = z.object({
  notificationId: z.string().uuid("ID da notificação inválido."),
  userId: z.string().uuid("ID do usuário inválido."),
});

export type MarkNotificationAsReadInput = z.infer<typeof markNotificationAsReadInputSchema>;

/**
 * @description Use case for marking a single notification as read for a user.
 * It ensures the notification exists and belongs to the user before marking it as read.
 *
 * @param {MarkNotificationAsReadInput} input - The input containing notificationId and userId.
 * @param {NotificationRepositoryFactory} [notificationRepoFactory=createNotificationRepository] - Optional factory.
 * @returns {Promise<void>}
 * @throws {ZodError} If input validation fails.
 * @throws {NotFoundError} If the notification with the given ID is not found.
 * @throws {Error} If the notification does not belong to the user (Authorization-like error).
 * @throws {Error} If there's an issue with the repository or other unexpected errors.
 */
export default async function markNotificationAsReadUseCase(
  input: MarkNotificationAsReadInput,
  notificationRepoFactory: NotificationRepositoryFactory = createNotificationRepository
): Promise<void> {
  const { notificationId, userId } = markNotificationAsReadInputSchema.parse(input);

  const notificationRepo = notificationRepoFactory(db);

  // 1. Verify notification exists and belongs to the user
  const notification = await notificationRepo.findById(notificationId);
  if (!notification) {
    throw new NotFoundError(`Notificação com ID ${notificationId} não encontrada.`);
  }

  if (notification.userId !== userId) {
    // TODO: Consider creating a specific AuthorizationError or AccessDeniedError
    throw new Error(
      "Usuário não autorizado a marcar esta notificação como lida."
    );
  }

  // 2. Mark as read (repository method already ensures it's for this user if designed well, but explicit check is good)
  if (!notification.isRead) { // Only update if not already read
    await notificationRepo.markAsRead(notificationId, userId);
  }
}
