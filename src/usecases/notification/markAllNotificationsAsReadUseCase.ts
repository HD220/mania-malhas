import { z } from "zod";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
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

    // The repository's markAllAsReadForUser method should return the count of updated rows.
    // The notificationRepository.test.ts for markAllAsReadForUser expects it to return { count: number }
    const updateResult = await this.notificationRepository.markAllAsReadForUser(userId);

    return {
      success: true,
      markedCount: updateResult.count,
    };
  }
}
