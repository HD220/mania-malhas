import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { ZodError } from "zod";

/**
 * Schema for validating the input data when marking all notifications as read for a user.
 */
export const markAllNotificationsAsReadInputSchema = z.object({
  /** The UUID of the user whose notifications are to be marked as read. */
  userId: z.string().uuid("ID do usuário inválido."),
});

/**
 * Type definition for the input data required to mark all notifications as read for a user.
 * Inferred from `markAllNotificationsAsReadInputSchema`.
 */
export type MarkAllNotificationsAsReadInput = z.infer<typeof markAllNotificationsAsReadInputSchema>;

/**
 * Interface defining the structure of the output when marking all notifications as read.
 * Includes a success flag and the count of notifications marked as read.
 */
export interface MarkAllNotificationsAsReadOutput {
  /** Boolean indicating whether the operation was successful. */
  success: boolean;
  /** The number of notifications that were marked as read. */
  markedCount: number;
}

/**
 * Use case for marking all unread notifications as read for a specific user.
 * It validates the input and uses the repository to perform the update.
 */
export class MarkAllNotificationsAsReadUseCase {
  /**
   * Constructs a new MarkAllNotificationsAsReadUseCase.
   * @param notificationRepository - The repository for notification data operations.
   */
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Executes the use case to mark all notifications as read for a user.
   * @param input - The input data containing the user ID, conforming to `MarkAllNotificationsAsReadInput`.
   * @returns A Promise that resolves to an object indicating success and the count of marked notifications, conforming to `MarkAllNotificationsAsReadOutput`.
   * @throws {ZodError} If the input validation fails.
   */
  async execute(input: MarkAllNotificationsAsReadInput): Promise<MarkAllNotificationsAsReadOutput> {
    const validationResult = markAllNotificationsAsReadInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ZodError(validationResult.error.issues);
    }

    const { userId } = validationResult.data;

    // The repository's markAllAsReadForUser method should return the count of updated rows.
    // The notificationRepository.test.ts for markAllAsReadForUser expects it to return { count: number }
    const updateResult = await this.notificationRepository.markAllAsReadForUser(userId);

    return {
      success: true,
      markedCount: updateResult.count,
    };
  }
}
