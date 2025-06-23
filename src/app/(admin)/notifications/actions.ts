"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { NotFoundError } from "@/lib/errors/domainErrors"; // Assuming AuthorizationError might be needed later

// Import Use Cases
import {
  ListNotificationsForUserUseCase,
  ListNotificationsForUserInput,
  ListNotificationsForUserOutput
} from "@/usecases/notification/listNotificationsForUserUseCase";
import {
  MarkNotificationAsReadUseCase,
  MarkNotificationAsReadInput
} from "@/usecases/notification/markNotificationAsReadUseCase";
import {
  MarkAllNotificationsAsReadUseCase,
  MarkAllNotificationsAsReadInput
} from "@/usecases/notification/markAllNotificationsAsReadUseCase";
import { notificationRepository } from "@/db/repositories/notificationRepository"; // For instantiation
import { db } from "@/db/postgres"; // For repository instantiation
import { DomainError, ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors"; // Added ForbiddenError, NotFoundError
import { internalGetUserIdFromSession } from "@/lib/auth/session"; // Import from new location


// ---- List Notifications Action ----
export type ListNotificationsServerResponse = {
  success: boolean;
  data?: ListNotificationsForUserOutput; // Use the correct output type
  message?: string;
  // fieldErrors could be added if we parse input directly here, but use case handles it
};

export async function listNotificationsAction(
  paginationOptions: { page?: number; pageSize?: number }
): Promise<ListNotificationsServerResponse> {
  const userId = await internalGetUserIdFromSession(); // Use the exported one for consistency if needed for tests
  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    const repo = notificationRepository(db);
    const useCase = new ListNotificationsForUserUseCase(repo);

    const input: ListNotificationsForUserInput = {
      userId,
      page: paginationOptions.page,
      pageSize: paginationOptions.pageSize
    };
    // Input validation for paginationOptions happens inside the use case schema
    const result = await useCase.execute(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("listNotificationsAction Error:", error.stack);
    if (error instanceof ZodError) {
      // This error is from the use case's input schema validation
      return { success: false, message: "Dados de entrada inválidos.", fieldErrors: error.flatten().fieldErrors };
    }
    if (error instanceof DomainError) { // Catch specific domain errors if any are thrown by this use case
        return { success: false, message: error.message };
    }
    return { success: false, message: "Falha ao buscar notificações. Tente novamente mais tarde." };
  }
}


// ---- Mark Notification as Read Action ----
export type MarkAsReadServerResponse = {
  success: boolean;
  data?: SelectNotification; // Return the updated notification
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function markAsReadAction(notificationId: string): Promise<MarkAsReadServerResponse> {
  const userId = await internalGetUserIdFromSession();
  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    const repo = notificationRepository(db);
    const useCase = new MarkNotificationAsReadUseCase(repo);
    const input: MarkNotificationAsReadInput = { notificationId, userId };

    const updatedNotification = await useCase.execute(input);

    revalidatePath("/(admin)/notifications"); // Example revalidation
    revalidateTag("user-notifications-count");   // Example revalidation for a potential counter

    return { success: true, data: updatedNotification, message: "Notificação marcada como lida." };
  } catch (error: any) {
    console.error("markAsReadAction Error:", error.stack);
    if (error instanceof ZodError) {
      return { success: false, message: "Dados de entrada inválidos.", fieldErrors: error.flatten().fieldErrors };
    }
    if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof DomainError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Falha ao marcar notificação como lida. Tente novamente mais tarde." };
  }
}

// ---- Mark All Notifications as Read Action ----
export type MarkAllAsReadServerResponse = {
  success: boolean;
  markedCount?: number;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function markAllAsReadAction(): Promise<MarkAllAsReadServerResponse> {
  const userId = await internalGetUserIdFromSession();
  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    const repo = notificationRepository(db);
    const useCase = new MarkAllNotificationsAsReadUseCase(repo);
    const input: MarkAllNotificationsAsReadInput = { userId };

    const result = await useCase.execute(input); // This returns { success: boolean, markedCount: number }

    revalidatePath("/(admin)/notifications");
    revalidateTag("user-notifications-count");

    return { success: true, markedCount: result.markedCount, message: "Todas as notificações foram marcadas como lidas." };
  } catch (error: any) {
    console.error("markAllAsReadAction Error:", error.stack);
     if (error instanceof ZodError) { // From use case input validation (userId)
      return { success: false, message: "Dados de entrada inválidos.", fieldErrors: error.flatten().fieldErrors };
    }
    if (error instanceof DomainError) {
        return { success: false, message: error.message };
    }
    return { success: false, message: "Falha ao marcar todas as notificações como lidas. Tente novamente mais tarde." };
  }
}
