import { db } from "@/db/postgres";
import {
  notificationRepository as createNotificationRepository,
  NotificationRepositoryFactory,
} from "@/db/repositories/notificationRepository";
import { SelectNotification } from "@/db/repositories/schemas/notificationSchema";
import { z } from "zod";

export const listNotificationsInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(10),
});

export type ListNotificationsInput = z.infer<typeof listNotificationsInputSchema>;

export interface PaginatedNotificationsResult {
  data: SelectNotification[];
  totalItems: number;
  totalUnread: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * @description Use case for listing notifications for a specific user with pagination.
 *
 * @param {ListNotificationsInput} input - The input containing userId and pagination options.
 * @param {NotificationRepositoryFactory} [notificationRepoFactory=createNotificationRepository] - Optional factory.
 * @returns {Promise<PaginatedNotificationsResult>} Paginated list of notifications and counts.
 * @throws {ZodError} If input validation fails.
 */
export default async function listNotificationsForUserUseCase(
  input: ListNotificationsInput,
  notificationRepoFactory: NotificationRepositoryFactory = createNotificationRepository
): Promise<PaginatedNotificationsResult> {
  const { userId, page, pageSize } = listNotificationsInputSchema.parse(input);

  const notificationRepo = notificationRepoFactory(db);

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const [data, totalItems, totalUnread] = await Promise.all([
    notificationRepo.findByUserId(userId, limit, offset),
    notificationRepo.countByUserId(userId),
    notificationRepo.countByUserId(userId, true), // true for onlyUnread
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data,
    totalItems,
    totalUnread,
    totalPages,
    currentPage: page,
    pageSize,
  };
}
