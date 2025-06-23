"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { GetUserProfileUseCase } from "@/usecases/user/getUserProfileUseCase";
import { UpdateUserProfileUseCase, updateUserProfileUseCaseInputSchema } from "@/usecases/user/updateUserProfileUseCase";
import { ChangeUserPasswordUseCase, changeUserPasswordUseCaseInputSchema } from "@/usecases/user/changeUserPasswordUseCase";

// Assuming SelectUser and UpdateUserProfile are correctly exported and used by use cases
import { SelectUser, UpdateUserProfile as UpdateUserProfileData } from "@/db/repositories/schemas/userSchema";

import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";
// Placeholder for session management - replace with actual implementation from a shared auth library
// For now, using the same placeholder as in notification actions.
async function internalGetUserIdFromSession(): Promise<string> {
  const placeholderUserId = "00000000-0000-0000-0000-000000000001"; // Standard test user ID
  console.warn(
    `internalGetUserIdFromSession (profile/actions.ts): Using hardcoded placeholder user ID ${placeholderUserId}. Replace with actual session logic.`
  );
  return placeholderUserId;
}

// Generic Action Response Interface
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


// --- getUserProfileAction ---
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

// --- updateUserProfileAction ---
// Input schema for the action itself, which is just the data part of the use case input.
// UserId will be injected from session.
export const updateUserProfileActionSchema = updateUserProfileUseCaseInputSchema.shape.data;
export type UpdateUserProfileActionInput = z.infer<typeof updateUserProfileActionSchema>;


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


// --- changeUserPasswordAction ---
// Action input schema, similar to use case but userId injected.
// Assuming client sends newPasswordHash directly as per simplified plan.
export const changeUserPasswordActionSchema = changeUserPasswordUseCaseInputSchema.omit({ userId: true });
export type ChangeUserPasswordActionInput = z.infer<typeof changeUserPasswordActionSchema>;

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
