"use server";

import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import createPartnerUseCase from "@/usecases/partner/createPartnerUseCase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

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
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: "Erro de validação nos dados fornecidos.",
      };
    }
    let errorMessage = "Erro ao criar parceiro. Tente novamente.";
    if (error instanceof Error) {
      console.error("createPartner Server Action Error:", error.message);
    } else {
      console.error("createPartner Server Action Unexpected Error:", error);
    }
    return { success: false, message: errorMessage };
  }
}
