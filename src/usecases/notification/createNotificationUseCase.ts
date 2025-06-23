import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { insertNotificationSchema, SelectNotification, selectNotificationSchema } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";
import { DomainError } from "@/lib/errors/domainErrors";

/**
 * Schema for validating the input data when creating a new notification.
 * It picks specific fields from the base `insertNotificationSchema`.
 */
export const createNotificationInputSchema = insertNotificationSchema.pick({
  userId: true,
  type: true,
  message: true,
  relatedEntityId: true,
  relatedEntityType: true,
});

/**
 * Type definition for the input data required to create a notification.
 * Inferred from `createNotificationInputSchema`.
 */
export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;

/**
 * Use case for creating a new notification.
 * It validates the input, persists the notification using the repository,
 * and returns the created notification.
 */
export class CreateNotificationUseCase {
  /**
   * Constructs a new CreateNotificationUseCase.
   * @param notificationRepository - The repository for notification data operations.
   */
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Executes the use case to create a new notification.
   * @param input - The data for the new notification, conforming to `CreateNotificationInput`.
   * @returns A Promise that resolves to the created notification, conforming to `SelectNotification`.
   * @throws {ZodError} If the input validation fails.
   * @throws {DomainError} If the notification cannot be retrieved after creation.
   */
  async execute(input: CreateNotificationInput): Promise<SelectNotification> {
    const validationResult = createNotificationInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ZodError(validationResult.error.issues);
    }

    const validatedData = validationResult.data;

    // The repository insert method returns an object like { id: string }
    // The input to insert should match InsertNotification, which createNotificationInputSchema now does (after picking)
    const insertedNotificationMeta = await this.notificationRepository.insert(validatedData);

    const newNotification = await this.notificationRepository.findById(insertedNotificationMeta.id);

    if (!newNotification) {
      throw new DomainError("Failed to retrieve notification immediately after creation.");
    }

    // Ensure the returned object conforms to SelectNotification
    // findById should already return SelectNotification or null
    return selectNotificationSchema.parse(newNotification);
  }
}
