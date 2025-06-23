import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { SelectNotification, selectNotificationSchema } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";

export const listNotificationsForUserInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
  page: z.number().int().positive("Página deve ser um inteiro positivo.").optional().default(1),
  pageSize: z.number().int().positive("Tamanho da página deve ser um inteiro positivo.").max(100, "Tamanho máximo da página é 100.").optional().default(10),
});

export type ListNotificationsForUserInput = z.infer<typeof listNotificationsForUserInputSchema>;

export interface ListNotificationsForUserOutput {
  notifications: SelectNotification[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export class ListNotificationsForUserUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

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
