"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { GetUserProfileUseCase } from "@/features/user/usecases/getUserProfileUseCase";
import { UpdateUserProfileUseCase, updateUserProfileUseCaseInputSchema } from "@/features/user/usecases/updateUserProfileUseCase";
import { ChangeUserPasswordUseCase, changeUserPasswordUseCaseInputSchema } from "@/features/user/usecases/changeUserPasswordUseCase";

// Assuming SelectUser and UpdateUserProfile are correctly exported and used by use cases
import { SelectUser, UpdateUserProfile as UpdateUserProfileData } from "@/features/user/schemas/userSchema";

import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";

/**
 * Placeholder for session management.
 * @async
 * @private
 * @function internalGetUserIdFromSession
 * @returns {Promise<string>} The user ID from the session.
 * @remarks This is a placeholder and should be replaced with actual session logic.
 * Currently, it returns a hardcoded user ID for development and testing.
 * This function is duplicated in other action files and should be centralized.
 */
async function internalGetUserIdFromSession(): Promise<string> {
  const placeholderUserId = "00000000-0000-0000-0000-000000000001"; // Standard test user ID
  console.warn(
    `internalGetUserIdFromSession (profile/actions.ts): Using hardcoded placeholder user ID ${placeholderUserId}. Replace with actual session logic.`
  );
  return placeholderUserId;
}

/**
 * Represents the standardized response structure for server actions.
 * @template T The type of data included in a successful response.
 * @property {boolean} success - Indicates if the action was successful.
 * @property {T} [data] - The data returned by the action on success.
 * @property {string} [error] - A general error message if the action failed.
 * @property {Record<string, string[]>} [fieldErrors] - Specific field error messages if validation failed.
 */
export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>; // For Zod field-specific errors
}

// Instantiate Use Cases
// Note: Use cases themselves instantiate repositories.
const getUserProfileUseCase = new GetUserProfileUseCase();
const updateUserProfileUseCase = new UpdateUserProfileUseCase();
const changeUserPasswordUseCase = new ChangeUserPasswordUseCase();


/**
 * Server action to retrieve the profile of the currently authenticated user.
 * @async
 * @function getUserProfileAction
 * @returns {Promise<ActionResponse<SelectUser>>} The user's profile data or an error response.
 * The `userId` is automatically injected from the current session.
 */
export async function getUserProfileAction(): Promise<ActionResponse<SelectUser>> {
  try {
    const userId = await internalGetUserIdFromSession();
    // Input for GetUserProfileUseCase is { userId: string }
    const userProfile = await getUserProfileUseCase.execute({ userId });
    return { success: true, data: userProfile };
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { success: false, error: err.message };
    }
    // Add ZodError check if GetUserProfileUseCase could throw it for its direct input (it does)
    if (err instanceof z.ZodError) {
        return { success: false, error: "Erro de validação ao buscar perfil.", fieldErrors: err.flatten().fieldErrors };
    }
    console.error("getUserProfileAction Error:", err);
    return { success: false, error: "Falha ao buscar perfil do usuário." };
  }
}

/**
 * Zod schema for the input data of the `updateUserProfileAction`.
 * This schema represents the fields that can be updated in a user's profile.
 * The `userId` is handled internally by the action.
 */
export const updateUserProfileActionSchema = updateUserProfileUseCaseInputSchema.shape.data;

/**
 * Type definition for the input of the `updateUserProfileAction`.
 * Inferred from `updateUserProfileActionSchema`.
 */
export type UpdateUserProfileActionInput = z.infer<typeof updateUserProfileActionSchema>;


/**
 * Server action to update the profile of the currently authenticated user.
 * @async
 * @function updateUserProfileAction
 * @param {UpdateUserProfileActionInput} data - The profile data to update.
 * @returns {Promise<ActionResponse<SelectUser>>} The updated user profile data or an error response.
 * The `userId` is automatically injected from the current session.
 */
export async function updateUserProfileAction(
  data: UpdateUserProfileActionInput
): Promise<ActionResponse<SelectUser>> {
  try {
    const userId = await internalGetUserIdFromSession();

    // The use case input schema is { userId: string, data: UpdateUserProfileData }
    // Validate the 'data' part specifically if not already done, or rely on use case validation.
    // The updateUserProfileUseCase will validate the combined input.
    const result = await updateUserProfileUseCase.execute({ userId, data });

    revalidatePath("/(admin)/profile");
    // Potentially revalidate other paths if user info (like name/avatar) is displayed globally (e.g., header)
    // revalidatePath("/(admin)", "layout");

    return { success: true, data: result };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação ao atualizar perfil.",
        // fieldErrors from use case are often nested under 'data', e.g., "data.email"
        // Flatten them appropriately or adjust form handling.
        fieldErrors: err.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (err instanceof NotFoundError) { // Should be caught by use case
      return { success: false, error: err.message };
    }
    console.error("updateUserProfileAction Error:", err);
    return { success: false, error: "Falha ao atualizar perfil do usuário." };
  }
}


/**
 * Zod schema for the input data of the `changeUserPasswordAction`.
 * This schema defines the structure for changing a user's password, typically including the new password.
 * The `userId` is handled internally by the action.
 */
export const changeUserPasswordActionSchema = changeUserPasswordUseCaseInputSchema.omit({ userId: true });

/**
 * Type definition for the input of the `changeUserPasswordAction`.
 * Inferred from `changeUserPasswordActionSchema`.
 */
export type ChangeUserPasswordActionInput = z.infer<typeof changeUserPasswordActionSchema>;

/**
 * Server action to change the password for the currently authenticated user.
 * @async
 * @function changeUserPasswordAction
 * @param {ChangeUserPasswordActionInput} data - The data required to change the password (e.g., new password hash).
 * @returns {Promise<ActionResponse<{ success: boolean }>>} A success or error response.
 * The `userId` is automatically injected from the current session.
 */
export async function changeUserPasswordAction(
  data: ChangeUserPasswordActionInput
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const userId = await internalGetUserIdFromSession();

    // Use case input is { userId: string, newPasswordHash: string }
    const result = await changeUserPasswordUseCase.execute({
      userId,
      newPasswordHash: data.newPasswordHash
    });

    // No specific path revalidation typically needed unless UI shows "password last changed"
    return { success: true, data: result };
  } catch (err) {
     if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação ao alterar senha.",
        fieldErrors: err.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (err instanceof NotFoundError) { // Caught by use case
      return { success: false, error: err.message };
    }
    console.error("changeUserPasswordAction Error:", err);
    return { success: false, error: "Falha ao alterar senha." };
  }
}
