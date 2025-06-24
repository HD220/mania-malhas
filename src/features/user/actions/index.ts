"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { GetUserProfileUseCase } from "@/features/user/usecases/getUserProfileUseCase";
import { UpdateUserProfileUseCase, updateUserProfileUseCaseInputSchema } from "@/features/user/usecases/updateUserProfileUseCase";
import { ChangeUserPasswordUseCase, changeUserPasswordUseCaseInputSchema } from "@/features/user/usecases/changeUserPasswordUseCase";

import { SelectUser, UpdateUserProfile as UpdateUserProfileData } from "@/features/user/schemas/userSchema";

import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";

async function internalGetUserIdFromSession(): Promise<string> {
  const placeholderUserId = "00000000-0000-0000-0000-000000000001";
  console.warn(
    `internalGetUserIdFromSession (user/actions/index.ts): Using hardcoded placeholder user ID ${placeholderUserId}. Replace with actual session logic.`
  );
  return placeholderUserId;
}

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const getUserProfileUseCase = new GetUserProfileUseCase();
const updateUserProfileUseCase = new UpdateUserProfileUseCase();
const changeUserPasswordUseCase = new ChangeUserPasswordUseCase();

export async function getUserProfileAction(): Promise<ActionResponse<SelectUser>> {
  try {
    const userId = await internalGetUserIdFromSession();
    const userProfile = await getUserProfileUseCase.execute({ userId });
    return { success: true, data: userProfile };
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { success: false, error: err.message };
    }
    if (err instanceof z.ZodError) {
        return { success: false, error: "Erro de validação ao buscar perfil.", fieldErrors: err.flatten().fieldErrors };
    }
    console.error("getUserProfileAction Error:", err);
    return { success: false, error: "Falha ao buscar perfil do usuário." };
  }
}

export const updateUserProfileActionSchema = updateUserProfileUseCaseInputSchema.shape.data;
export type UpdateUserProfileActionInput = z.infer<typeof updateUserProfileActionSchema>;

export async function updateUserProfileAction(
  data: UpdateUserProfileActionInput
): Promise<ActionResponse<SelectUser>> {
  try {
    const userId = await internalGetUserIdFromSession();
    const result = await updateUserProfileUseCase.execute({ userId, data });
    revalidatePath("/(admin)/profile");
    return { success: true, data: result };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação ao atualizar perfil.",
        fieldErrors: err.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (err instanceof NotFoundError) {
      return { success: false, error: err.message };
    }
    console.error("updateUserProfileAction Error:", err);
    return { success: false, error: "Falha ao atualizar perfil do usuário." };
  }
}

export const changeUserPasswordActionSchema = changeUserPasswordUseCaseInputSchema.omit({ userId: true });
export type ChangeUserPasswordActionInput = z.infer<typeof changeUserPasswordActionSchema>;

export async function changeUserPasswordAction(
  data: ChangeUserPasswordActionInput
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const userId = await internalGetUserIdFromSession();
    const result = await changeUserPasswordUseCase.execute({
      userId,
      newPasswordHash: data.newPasswordHash
    });
    return { success: true, data: result };
  } catch (err) {
     if (err instanceof z.ZodError) {
      return {
        success: false,
        error: "Erro de validação ao alterar senha.",
        fieldErrors: err.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    if (err instanceof NotFoundError) {
      return { success: false, error: err.message };
    }
    console.error("changeUserPasswordAction Error:", err);
    return { success: false, error: "Falha ao alterar senha." };
  }
}
