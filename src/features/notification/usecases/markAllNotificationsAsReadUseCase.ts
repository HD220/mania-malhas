import { z } from "zod";
import { NotificationRepository } from "@/features/notification/db/notificationRepository";
import { ZodError } from "zod";

export const markAllNotificationsAsReadInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
});

export type MarkAllNotificationsAsReadInput = z.infer<typeof markAllNotificationsAsReadInputSchema>;

export interface MarkAllNotificationsAsReadOutput {
  success: boolean;
  markedCount: number;
}

export class MarkAllNotificationsAsReadUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(input: MarkAllNotificationsAsReadInput): Promise<MarkAllNotificationsAsReadOutput> {
    const validationResult = markAllNotificationsAsReadInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ZodError(validationResult.error.issues);
    }

    const { userId } = validationResult.data;

    // The repository method in the actual implementation returns void,
    // but the test (and this use case previously) expected a count.
    // For now, let's assume the use case *should* return a count,
    // implying the repository might need adjustment or this use case would count before/after.
    // Let's get the count of unread notifications first.
    const unreadCount = await this.notificationRepository.countByUserId(userId, true);

    if (unreadCount > 0) {
      await this.notificationRepository.markAllAsReadForUser(userId);
    }

    return {
      success: true,
      markedCount: unreadCount, // Return the count of items that *were* unread
    };
  }
}
