import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { SelectNotification, selectNotificationSchema } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";
import { NotFoundError, ForbiddenError } from "@/lib/errors/domainErrors";

/**
 * Schema for validating the input data when marking a specific notification as read.
 * Requires both notification ID and user ID (for ownership verification).
 */
export const markNotificationAsReadInputSchema = z.object({
  /** The UUID of the notification to be marked as read. */
  notificationId: z.string().uuid("ID da notificação inválido."),
  /** The UUID of the user attempting to mark the notification. Used for ownership validation. */
  userId: z.string().uuid("ID do usuário inválido."),
});

/**
 * Type definition for the input data required to mark a notification as read.
 * Inferred from `markNotificationAsReadInputSchema`.
 */
export type MarkNotificationAsReadInput = z.infer<typeof markNotificationAsReadInputSchema>;

/**
 * Use case for marking a specific notification as read.
 * It validates the input, checks for notification existence and ownership,
 * and then updates the notification's `isRead` status via the repository.
 */
export class MarkNotificationAsReadUseCase {
  /**
   * Constructs a new MarkNotificationAsReadUseCase.
   * @param notificationRepository - The repository for notification data operations.
   */
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Executes the use case to mark a specific notification as read.
   * @param input - The input data containing notification ID and user ID, conforming to `MarkNotificationAsReadInput`.
   * @returns A Promise that resolves to the updated notification, conforming to `SelectNotification`.
   * @throws {ZodError} If the input validation fails.
   * @throws {NotFoundError} If the notification with the given ID is not found.
   * @throws {ForbiddenError} If the user does not own the notification.
   */
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
