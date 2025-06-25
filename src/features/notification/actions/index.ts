"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  ListNotificationsForUserUseCase,
  listNotificationsForUserInputSchema,
  ListNotificationsForUserOutput,
  ListNotificationsForUserInput, // Import this type
} from "@/features/notification/usecases/listNotificationsForUserUseCase";
import {
  MarkNotificationAsReadUseCase,
  markNotificationAsReadInputSchema, // This is for the use case, client input schema is separate
  MarkNotificationAsReadInput,
} from "@/features/notification/usecases/markNotificationAsReadUseCase";
import {
  MarkAllNotificationsAsReadUseCase,
  markAllNotificationsAsReadInputSchema, // This is for the use case
  MarkAllNotificationsAsReadOutput,
  MarkAllNotificationsAsReadInput,
} from "@/features/notification/usecases/markAllNotificationsAsReadUseCase";
import { notificationRepository, userRepository } from "@/db/repositories"; // userRepository for placeholder
import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";
import { SelectNotification } from "@/features/notification/schemas/notificationSchema"; // For return types

async function internalGetUserIdFromSession(): Promise<string> {
  const placeholderUserId = "00000000-0000-0000-0000-000000000001";
  console.warn(
    `internalGetUserIdFromSession (notification/actions/index.ts): Using hardcoded placeholder user ID ${placeholderUserId}. Replace with actual session logic.`
  );
  return placeholderUserId;
}

const listNotificationsUseCase = new ListNotificationsForUserUseCase(notificationRepository());
const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository());
const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationRepository());

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export type ListNotificationsActionInput = Omit<ListNotificationsForUserInput, 'userId'> & { userId?: string };

export async function listNotificationsAction(
  input: ListNotificationsActionInput
): Promise<ActionResponse<ListNotificationsForUserOutput>> {
  try {
    const sessionUserId = await internalGetUserIdFromSession();
    const validatedInput = listNotificationsForUserInputSchema.parse({
        ...input,
        userId: sessionUserId,
    });
    const result = await listNotificationsUseCase.execute(validatedInput);
    return { success: true, data: result };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação.",
        fieldErrors: err.flatten().fieldErrors,
      };
    }
    console.error("listNotificationsAction Error:", err);
    return { success: false, error: "Falha ao listar notificações." };
  }
}

export const markAsReadActionClientInputSchema = z.object({
  notificationId: z.string().uuid("ID da notificação inválido."),
});
export type MarkAsReadActionClientInput = z.infer<typeof markAsReadActionClientInputSchema>;

export async function markAsReadAction(
  input: MarkAsReadActionClientInput
): Promise<ActionResponse<SelectNotification | null >> { // Return updated notification or null
  try {
    const sessionUserId = await internalGetUserIdFromSession();
    const clientValidation = markAsReadActionClientInputSchema.safeParse(input);
    if (!clientValidation.success) {
      throw new z.ZodError(clientValidation.error.issues);
    }
    const useCaseInput: MarkNotificationAsReadInput = {
      notificationId: clientValidation.data.notificationId,
      userId: sessionUserId,
    };
    const updatedNotification = await markNotificationAsReadUseCase.execute(useCaseInput);
    revalidatePath("/(admin)/notifications", "page");
    return { success: true, data: updatedNotification };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação.",
        fieldErrors: err.flatten().fieldErrors,
      };
    }
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      return { success: false, error: err.message };
    }
    console.error("markAsReadAction Error:", err);
    return { success: false, error: "Falha ao marcar notificação como lida." };
  }
}

export async function markAllAsReadAction(): Promise<ActionResponse<MarkAllNotificationsAsReadOutput>> {
  try {
    const sessionUserId = await internalGetUserIdFromSession();
    const useCaseInput: MarkAllNotificationsAsReadInput = {
      userId: sessionUserId,
    };
    const result = await markAllNotificationsAsReadUseCase.execute(useCaseInput);
    revalidatePath("/(admin)/notifications", "page");
    return { success: true, data: result };
  } catch (err) {
    if (err instanceof z.ZodError) {
         return {
             success: false,
             error: "Erro de validação.",
             fieldErrors: err.flatten().fieldErrors,
         };
    }
    console.error("markAllAsReadAction Error:", err);
    return { success: false, error: "Falha ao marcar todas as notificações como lidas." };
  }
}
