"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import createPartnerUseCase from "@/features/partner/usecases/create-partner.usecase";
import {
  InsertPartner,
  insertPartnerSchema, // Assuming this might be used for validation within the action itself
} from "@/features/partner/types/partner.schema";

export type CreatePartnerServerResponse = {
  success: boolean;
  errors?: ZodError<InsertPartner>["formErrors"]["fieldErrors"];
  message?: string;
  partner?: InsertPartner; // Optionally return the created partner
};

export async function createPartner(
  data: InsertPartner
): Promise<CreatePartnerServerResponse> {
  try {
    // createPartnerUseCase will perform validation and throw ZodError if invalid
    const newPartner = await createPartnerUseCase(data); // Assuming use case returns the created entity or its ID

    revalidatePath("/partner/list");
    // Redirect should be handled by the client after receiving a success response
    // redirect("/partner/list");
    return {
      success: true,
      message: "Parceiro criado com sucesso!",
      partner: newPartner, // Adjust if use case returns something else e.g. {id: string}
    };
  } catch (error: unknown) { // Tipar error como unknown
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
