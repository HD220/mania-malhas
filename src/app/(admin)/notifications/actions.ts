"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { NotFoundError } from "@/lib/errors/domainErrors"; // Assuming AuthorizationError might be needed later

// Import Use Cases
import listNotificationsForUserUseCase, {
  PaginatedNotificationsResult,
  ListNotificationsInput
} from "@/usecases/notification/listNotificationsForUserUseCase";
import markNotificationAsReadUseCase, {
  MarkNotificationAsReadInput
} from "@/usecases/notification/markNotificationAsReadUseCase";
import markAllNotificationsAsReadUseCase, {
  MarkAllNotificationsAsReadInput
} from "@/usecases/notification/markAllNotificationsAsReadUseCase";

// TODO: Replace with actual user session logic
const getUserIdFromSession = async (): Promise<string | null> => {
  // Placeholder: In a real app, this would get the user ID from the session (e.g., NextAuth.js)
  // For now, returning a hardcoded UUID for testing purposes or null if no user.
  // This needs to be replaced with actual authentication logic.
  // return "00000000-0000-0000-0000-000000000000"; // Example static UUID for testing
  return null; // Default to no user for safety until auth is integrated
};

// Export for testing purposes, allowing spyOn to work.
// In a real app, this would likely come from a dedicated auth module.
export const internalGetUserIdFromSession = getUserIdFromSession;


// ---- List Notifications Action ----
export type ListNotificationsServerResponse = {
  success: boolean;
  data?: PaginatedNotificationsResult;
  message?: string;
};

export async function listNotificationsAction(
  paginationOptions: { page?: number; pageSize?: number }
): Promise<ListNotificationsServerResponse> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    // Directly pass pagination options. Use case defaults will apply if undefined.
    const input: ListNotificationsInput = {
      userId,
      page: paginationOptions.page,
      pageSize: paginationOptions.pageSize
    };
    const result = await listNotificationsForUserUseCase(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("listNotificationsAction Error:", error);
    if (error instanceof ZodError) { // Should ideally not happen if types are correct from client
      return { success: false, message: "Dados de paginação inválidos." };
    }
    return { success: false, message: error.message || "Falha ao buscar notificações." };
  }
}


// ---- Mark Notification as Read Action ----
export type MarkAsReadServerResponse = {
  success: boolean;
  message?: string;
};

export async function markAsReadAction(notificationId: string): Promise<MarkAsReadServerResponse> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    const input: MarkNotificationAsReadInput = { notificationId, userId };
    await markNotificationAsReadUseCase(input);
    // TODO: Determine which paths to revalidate.
    // Example: revalidatePath("/(admin)/notifications");
    // Or if there's a header component showing unread count: revalidateTag("unread_notifications_count");
    return { success: true, message: "Notificação marcada como lida." };
  } catch (error: any) {
    console.error("markAsReadAction Error:", error);
    if (error instanceof ZodError) {
      return { success: false, message: "ID da notificação inválido."};
    }
    if (error instanceof NotFoundError) {
      return { success: false, message: error.message };
    }
    // Catching generic Error for unauthorized access from use case
    if (error.message.includes("Usuário não autorizado")) {
        return { success: false, message: error.message };
    }
    return { success: false, message: error.message || "Falha ao marcar notificação como lida." };
  }
}

// ---- Mark All Notifications as Read Action ----
export type MarkAllAsReadServerResponse = {
  success: boolean;
  message?: string;
};

export async function markAllAsReadAction(): Promise<MarkAllAsReadServerResponse> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return { success: false, message: "Usuário não autenticado." };
  }

  try {
    const input: MarkAllNotificationsAsReadInput = { userId };
    await markAllNotificationsAsReadUseCase(input);
    // TODO: Determine which paths to revalidate.
    // Example: revalidatePath("/(admin)/notifications");
    // revalidateTag("unread_notifications_count");
    return { success: true, message: "Todas as notificações foram marcadas como lidas." };
  } catch (error: any) {
    console.error("markAllAsReadAction Error:", error);
     if (error instanceof ZodError) { // Should not happen if userId from session is always valid
      return { success: false, message: "ID do usuário inválido."};
    }
    return { success: false, message: error.message || "Falha ao marcar todas as notificações como lidas." };
  }
}
