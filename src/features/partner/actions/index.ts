"use server";

import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation"; // Though not currently used, might be in future
import { ZodError } from "zod";

import alterPartnerUseCase from '@/features/partner/usecases/alter-partner.usecase';
import createPartnerUseCase from '@/features/partner/usecases/create-partner.usecase';
import getPartnerByIdUseCase from '@/features/partner/usecases/get-partner-by-id.usecase';
import searchPartnersUseCase from "@/features/partner/usecases/search-partners.usecase";

import {
  InsertPartner,
  insertPartnerSchema, // This might not be directly used by all actions, but good to have if needed
} from "../types/partner.schema";

// Types from [id]/edit/actions.tsx
export type UpdatePartnerServerResponse = {
  success: boolean;
  errors?: ZodError<Omit<InsertPartner, "id">>["formErrors"]["fieldErrors"];
  message?: string;
  partner?: InsertPartner;
};

// Types from new/actions.tsx
export type CreatePartnerServerResponse = {
  success: boolean;
  errors?: ZodError<InsertPartner>["formErrors"]["fieldErrors"];
  message?: string;
  partner?: InsertPartner;
};

// Action from [id]/edit/actions.tsx
export async function getPartnerById(id: string) {
  noStore();
  return await getPartnerByIdUseCase(id);
}

// Action from [id]/edit/actions.tsx
export async function updatePartner({
  id,
  ...data
}: InsertPartner): Promise<UpdatePartnerServerResponse> {
  if (!id) {
    return { success: false, message: "ID do parceiro não fornecido." };
  }
  try {
    await alterPartnerUseCase(id, data);
    revalidatePath("/partner/list");
    revalidatePath(`/partner/${id}/edit`);
    return {
      success: true,
      message: "Parceiro atualizado com sucesso!",
      partner: { id, ...data },
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: error.flatten().formErrors.length > 0 ? error.flatten().formErrors.join(', ') : "Erro de validação nos dados fornecidos."
      };
    }
    let errorMessage = "Erro ao atualizar parceiro. Tente novamente.";
    if (error instanceof Error) {
      console.error("updatePartner Server Action Error:", error.message, error.stack);
    } else {
      console.error("updatePartner Server Action Unexpected Error Type:", error);
    }
    return { success: false, message: errorMessage };
  }
}

// Action from new/actions.tsx
export async function createPartner(
  data: InsertPartner
): Promise<CreatePartnerServerResponse> {
  try {
    const newPartner = await createPartnerUseCase(data);
    revalidatePath("/partner/list");
    return {
      success: true,
      message: "Parceiro criado com sucesso!",
      partner: newPartner,
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: error.flatten().formErrors.length > 0 ? error.flatten().formErrors.join(', ') : "Erro de validação nos dados fornecidos."
      };
    }
    let errorMessage = "Erro ao criar parceiro. Tente novamente.";
    if (error instanceof Error) {
      console.error("createPartner Server Action Error:", error.message, error.stack);
    } else {
      console.error("createPartner Server Action Unexpected Error Type:", error);
    }
    return { success: false, message: errorMessage };
  }
}

// Action from list/actions.tsx
export async function getPartners(search: string, status: boolean) {
  noStore();
  return await searchPartnersUseCase(search, status);
}
