"use server";

import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import alterPartnerUseCase from "@/usecases/partner/alterPartnerUseCase";
import getPartnerByIdUseCase from "@/usecases/partner/getPartnerByIdUseCase";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

export type UpdatePartnerServerResponse = {
  success: boolean;
  errors?: ZodError<Omit<InsertPartner, "id">>["formErrors"]["fieldErrors"]; // Assuming id is not part of validated data here
  message?: string;
  partner?: InsertPartner; // Optionally return the updated partner
};

export async function getPartnerById(id: string) {
  noStore();
  // TODO: Handle partner not found, similar to getProductById.
  // getPartnerByIdUseCase now returns null if not found or id is invalid.
  return await getPartnerByIdUseCase(id); // Chamada simplificada
}

export async function updatePartner({
  id,
  ...data
}: InsertPartner): Promise<UpdatePartnerServerResponse> {
  if (!id) {
    return { success: false, message: "ID do parceiro não fornecido." };
  }

  try {
    // alterPartnerUseCase will perform validation and throw ZodError if invalid
    // It expects the full partner data, potentially including fields not directly from the form
    // but necessary for the use case logic.
    await alterPartnerUseCase(id, data); // Pass 'data' which is InsertPartner excluding id

    revalidatePath("/partner/list");
    revalidatePath(`/partner/${id}/edit`);

    return {
      success: true,
      message: "Parceiro atualizado com sucesso!",
      partner: { id, ...data }, // Return the full partner data including id
    };
  } catch (error: unknown) { // Tipar error como unknown
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
