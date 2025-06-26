import { z } from "zod";
import { NotificationRepository } from "@/features/notification/db/notification-repository";
import { insertNotificationSchema, SelectNotification, selectNotificationSchema } from "@/features/notification/schemas/notificationSchema";
import { ZodError } from "zod";
import { DomainError } from "@/lib/errors/domainErrors";

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
    const insertedNotificationMeta = await this.notificationRepository.insert(validatedData);
    const newNotification = await this.notificationRepository.findById(insertedNotificationMeta.id);

    if (!newNotification) {
      throw new DomainError("Failed to retrieve notification immediately after creation.");
    }
    return selectNotificationSchema.parse(newNotification);
  }
}
