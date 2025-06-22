import { db } from "@/db/postgres";
import {
  notificationRepository as createNotificationRepository,
  NotificationRepositoryFactory,
} from "@/db/repositories/notificationRepository";
import { z } from "zod";

export const markAllNotificationsAsReadInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
});

export type MarkAllNotificationsAsReadInput = z.infer<typeof markAllNotificationsAsReadInputSchema>;

/**
 * @description Use case for marking all notifications as read for a specific user.
 *
 * @param {MarkAllNotificationsAsReadInput} input - The input containing the userId.
 * @param {NotificationRepositoryFactory} [notificationRepoFactory=createNotificationRepository] - Optional factory.
 * @returns {Promise<void>}
 * @throws {ZodError} If input validation fails.
 * @throws {Error} If there's an issue with the repository or other unexpected errors.
 */
export default async function markAllNotificationsAsReadUseCase(
  input: MarkAllNotificationsAsReadInput,
  notificationRepoFactory: NotificationRepositoryFactory = createNotificationRepository
): Promise<void> {
  const { userId } = markAllNotificationsAsReadInputSchema.parse(input);

  const notificationRepo = notificationRepoFactory(db);

  await notificationRepo.markAllAsReadForUser(userId);
}
