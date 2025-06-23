"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  ListNotificationsForUserUseCase,
  listNotificationsForUserInputSchema,
  ListNotificationsForUserOutput,
} from "@/usecases/notification/listNotificationsForUserUseCase";
import {
  MarkNotificationAsReadUseCase,
  markNotificationAsReadInputSchema,
  MarkNotificationAsReadInput, // Import the type
} from "@/usecases/notification/markNotificationAsReadUseCase";
import {
  MarkAllNotificationsAsReadUseCase,
  markAllNotificationsAsReadInputSchema,
  MarkAllNotificationsAsReadOutput,
  MarkAllNotificationsAsReadInput, // Import the type
} from "@/usecases/notification/markAllNotificationsAsReadUseCase";
import { notificationRepository } from "@/db/repositories";
import { userRepository } from "@/db/repositories"; // Needed for session placeholder
import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";

// Placeholder for session management - replace with actual implementation
async function internalGetUserIdFromSession(): Promise<string> {
  // This is a placeholder. In a real app, this would get the user ID from the session.
  // For development and testing without full auth, we might use a fixed ID.
  // Ensure a user with this ID exists in your seed data if your use cases depend on it.

  // const users = await userRepository.findMany({}); // Simplified find
  // if (users.length === 0) {
  //   console.error("internalGetUserIdFromSession: No users found in the database. Please seed the database.");
  //   throw new Error("No users found. Cannot simulate session.");
  // }
  // const userIdToUse = users[0].id;
  // console.warn(
  //  `internalGetUserIdFromSession: Using placeholder user ID ${userIdToUse}. Replace with actual session logic.`
  // );
  // return userIdToUse;

  // Using a fixed UUID for now as per previous agent's work, assuming this user exists.
  // This avoids a DB call in this placeholder, but requires the DB to be seeded appropriately.
  const placeholderUserId = "00000000-0000-0000-0000-000000000001"; // Standard test user ID
   console.warn(
     `internalGetUserIdFromSession: Using hardcoded placeholder user ID ${placeholderUserId}. Replace with actual session logic.`
   );
  return placeholderUserId;
}

const listNotificationsUseCase = new ListNotificationsForUserUseCase(notificationRepository);
const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);
const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationRepository);

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// For listNotificationsAction, the input should be Partial because userId will be injected
export type ListNotificationsActionInput = Omit<z.infer<typeof listNotificationsForUserInputSchema>, 'userId'> & { userId?: string };

export async function listNotificationsAction(
  input: ListNotificationsActionInput
): Promise<ActionResponse<ListNotificationsForUserOutput>> {
  try {
    const sessionUserId = await internalGetUserIdFromSession();

    // The use case input schema requires userId. We ensure it's always from the session.
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
    // The use case itself should not throw ForbiddenError for listing, as it lists for the given userId.
    // Authorization (e.g. admin listing others) would be a higher-level concern or different use case.
    console.error("listNotificationsAction Error:", err);
    return { success: false, error: "Falha ao listar notificações." };
  }
}

// For markAsReadAction, the input from the client is just the notificationId
export const markAsReadActionClientInputSchema = z.object({
  notificationId: z.string().uuid("ID da notificação inválido."),
});
export type MarkAsReadActionClientInput = z.infer<typeof markAsReadActionClientInputSchema>;


export async function markAsReadAction(
  input: MarkAsReadActionClientInput
): Promise<ActionResponse<null>> {
  try {
    const sessionUserId = await internalGetUserIdFromSession();

    // Validate client input first
    const clientValidation = markAsReadActionClientInputSchema.safeParse(input);
    if (!clientValidation.success) {
      throw new z.ZodError(clientValidation.error.issues);
    }

    // Prepare input for the use case, including the session userId
    const useCaseInput: MarkNotificationAsReadInput = {
      notificationId: clientValidation.data.notificationId,
      userId: sessionUserId,
    };

    // No need to parse with markNotificationAsReadInputSchema again if types are correct
    // as the use case will do its own validation.

    await markNotificationAsReadUseCase.execute(useCaseInput);

    revalidatePath("/(admin)/notifications", "page");
    // Example: revalidate a layout if it contains a global notification counter
    // revalidatePath("/(admin)", "layout");
    return { success: true, data: null };
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
    // No need to parse with markAllNotificationsAsReadInputSchema again
    // as the use case will do its own validation.

    const result = await markAllNotificationsAsReadUseCase.execute(useCaseInput);

    revalidatePath("/(admin)/notifications", "page");
    // Example: revalidatePath("/(admin)", "layout");
    return { success: true, data: result };
  } catch (err) {
    // The use case for markAllAsRead doesn't throw NotFoundError or ForbiddenError based on its current impl.
    // It would only throw ZodError for invalid userId format.
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
