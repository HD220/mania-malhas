"use server";

import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/db/repositories/schemas/productImageSchema";
import alterProductUseCase from "@/usecases/product/alterProductUseCase";
import getProductByIdUseCase from "@/usecases/product/getProductByIdUseCase";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

// Define a type for the structured error response, similar to createProduct
// Assuming InsertProductWithImages is the schema used for validation
type FormattedZodError = ZodError<InsertProductWithImages>["formErrors"];

export type UpdateProductServerResponse = {
  success: boolean;
  errors?: FormattedZodError["fieldErrors"];
  message?: string;
  product?: InsertProductWithImages & { id: string }; // Optionally return the updated product
};

export async function getProductWithImagesById(id: string) {
  noStore();
  // TODO: Handle case where product is not found.
  // Consider returning null or throwing a custom NotFoundError
  // which can be handled by the page component.
  return await getProductByIdUseCase({ id });
}

export async function updateProduct({
  id,
  ...data
}: InsertProductWithImages & { id: string }): Promise<UpdateProductServerResponse> {
  if (!id) {
    // This case should ideally be prevented by UI or earlier checks
    return { success: false, message: "ID do produto não fornecido." };
  }

  try {
    // The use case (alterProductUseCase) already performs validation and throws ZodError.
    // So, direct call is fine. If it didn't, parse would be needed here.
    // const validatedData = insertProductWithImagesSchema.parse(data);
    // await alterProductUseCase(id, validatedData);

    // As alterProductUseCase handles validation, we can call it directly.
    // It will throw ZodError if input is invalid.
    await alterProductUseCase(id, data);

    revalidatePath("/product/list");
    revalidatePath(`/product/${id}/edit`); // Revalidate the edit page as well

    // Instead of redirecting here, return success and let client handle redirection
    // redirect("/product/list");
    return {
      success: true,
      message: "Produto atualizado com sucesso!",
      product: { id, ...data },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: "Erro de validação.",
      };
    }
    console.error("updateProduct Error:", error);
    // For other types of errors, return a generic error message
    return {
      success: false,
      message: "Erro ao atualizar produto. Tente novamente.",
    };
  }
}
