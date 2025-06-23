import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { insertNotificationSchema, SelectNotification, selectNotificationSchema } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";
import { DomainError } from "@/lib/errors/domainErrors";

// Use the existing insertNotificationSchema directly or pick relevant fields
// The F05.4 createTransactionUseCase implies: userId, type, message, relatedEntityId, relatedEntityType
export const createNotificationInputSchema = insertNotificationSchema.pick({
  userId: true,
  type: true,
  message: true,
  relatedEntityId: true,
  relatedEntityType: true,
});

export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;

export class CreateNotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

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
