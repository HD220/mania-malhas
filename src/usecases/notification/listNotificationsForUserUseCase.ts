import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { SelectNotification, selectNotificationSchema } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";

/**
 * Schema for validating the input data when listing notifications for a user.
 * Includes user ID and pagination parameters.
 */
export const listNotificationsForUserInputSchema = z.object({
  /** The UUID of the user whose notifications are to be listed. */
  userId: z.string().uuid("ID do usuário inválido."),
  /** The page number for pagination (1-indexed). Defaults to 1. */
  page: z.number().int().positive("Página deve ser um inteiro positivo.").optional().default(1),
  /** The number of notifications per page. Defaults to 10, max 100. */
  pageSize: z.number().int().positive("Tamanho da página deve ser um inteiro positivo.").max(100, "Tamanho máximo da página é 100.").optional().default(10),
});

/**
 * Type definition for the input data required to list notifications for a user.
 * Inferred from `listNotificationsForUserInputSchema`.
 */
export type ListNotificationsForUserInput = z.infer<typeof listNotificationsForUserInputSchema>;

/**
 * Interface defining the structure of the output when listing notifications for a user.
 * Includes the list of notifications and pagination details.
 */
export interface ListNotificationsForUserOutput {
  /** An array of notifications for the current page. */
  notifications: SelectNotification[];
  /** The total number of notifications available for the user. */
  totalCount: number;
  /** The current page number. */
  currentPage: number;
  /** The total number of pages available. */
  totalPages: number;
  /** The number of notifications per page. */
  pageSize: number;
}

/**
 * Use case for listing notifications for a specific user with pagination.
 * It validates the input, fetches notifications and total count from the repository,
 * and returns them along with pagination information.
 */
export class ListNotificationsForUserUseCase {
  /**
   * Constructs a new ListNotificationsForUserUseCase.
   * @param notificationRepository - The repository for notification data operations.
   */
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Executes the use case to list notifications for a user.
   * @param input - The input data containing user ID and pagination options, conforming to `ListNotificationsForUserInput`.
   * @returns A Promise that resolves to an object containing the notifications and pagination details, conforming to `ListNotificationsForUserOutput`.
   * @throws {ZodError} If the input validation fails.
   */
  async execute(input: ListNotificationsForUserInput): Promise<ListNotificationsForUserOutput> {
    const validationResult = listNotificationsForUserInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ZodError(validationResult.error.issues);
    }

    const { userId, page, pageSize } = validationResult.data;

    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    // Assuming findByUserId in repository now accepts an object with userId, limit, offset
    const notificationsPromise = this.notificationRepository.findByUserId({
      userId,
      limit,
      offset
    });

    const totalCountPromise = this.notificationRepository.countByUserId(userId);

    const [notifications, totalCount] = await Promise.all([notificationsPromise, totalCountPromise]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      notifications: notifications.map(n => selectNotificationSchema.parse(n)), // Ensure conformity after fetching
      totalCount,
      currentPage: page,
      totalPages,
      pageSize,
    };
  }
}
