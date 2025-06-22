import { db } from "@/db/postgres";
import {
  notificationRepository as createNotificationRepository,
  NotificationRepositoryFactory,
} from "@/db/repositories/notificationRepository";
import {
  InsertNotification,
  SelectNotification,
  insertNotificationSchema,
} from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";

// Input type for creating a notification is directly InsertNotification
// as id, createdAt are already omitted in insertNotificationSchema.
export type CreateNotificationInput = InsertNotification;

/**
 * @description Use case for creating a new notification.
 * It validates the input data, persists the notification using the repository,
 * and then fetches and returns the complete notification object.
 *
 * @param {CreateNotificationInput} notificationData - The data for the new notification.
 * @param {NotificationRepositoryFactory} [notificationRepoFactory=createNotificationRepository] - Optional factory for notification repository.
 * @returns {Promise<SelectNotification>} The created notification.
 * @throws {ZodError} If input data validation fails.
 * @throws {Error} If there's an issue with the repository or other unexpected errors.
 */
export default async function createNotificationUseCase(
  notificationData: CreateNotificationInput,
  notificationRepoFactory: NotificationRepositoryFactory = createNotificationRepository
): Promise<SelectNotification> {
  // 1. Validate input data
  const parsedData = insertNotificationSchema.parse(notificationData);

  const notificationRepo = notificationRepoFactory(db);

  // 2. Persist the notification
  const { id: newId } = await notificationRepo.insert(parsedData);

  // 3. Fetch the complete notification object
  const newNotification = await notificationRepo.findById(newId);

  if (!newNotification) {
    // This case should ideally not happen if insert was successful and ID is correct.
    throw new Error(
      "Falha ao recuperar a notificação criada após a inserção."
    );
  }

  return newNotification;
}
