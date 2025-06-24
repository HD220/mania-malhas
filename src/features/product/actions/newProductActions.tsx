"use server";

import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/features/product/schemas/productImageSchema";
import createProductUseCase from "@/features/product/usecases/createProductUseCase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError, z } from "zod";

// Define a type for the structured error response
export type FormattedZodError = z.inferFlattenedErrors<typeof insertProductWithImagesSchema>;

export type CreateProductServerResponse = {
  success: boolean;
  errors?: FormattedZodError["fieldErrors"];
  message?: string;
};

export async function createProduct(
  data: InsertProductWithImages
): Promise<CreateProductServerResponse> {
  try {
    // The use case now throws ZodError on validation failure.
    // The initial parse in the Server Action might be redundant if the use case does it,
    // but it's good for early exit.
    const parsedData = insertProductWithImagesSchema.parse(data); // This will throw if data is invalid before calling use case

    await createProductUseCase(parsedData);

    revalidatePath("/product/list");
    // redirect("/product/list"); // Redirect should happen on the client after successful form submission feedback
    return { success: true, message: "Produto criado com sucesso!" };
  } catch (error: unknown) { // Tipar error como unknown
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: error.flatten().formErrors.length > 0 ? error.flatten().formErrors.join(', ') : "Erro de validação nos dados fornecidos."
      };
    }

    let errorMessage = "Erro ao criar produto. Tente novamente.";
    if (error instanceof Error) {
      // Logar a mensagem de erro real no servidor para debugging
      console.error("createProduct Server Action Error:", error.message, error.stack);
      // Não expor error.message diretamente ao cliente por padrão, a menos que seja seguro e intencional.
      // Se o use case lançar erros de domínio customizados com mensagens seguras, elas poderiam ser usadas.
      // errorMessage = error.message;
    } else {
      // Lidar com casos onde o erro não é uma instância de Error
      console.error("createProduct Server Action Unexpected Error Type:", error);
    }
    return { success: false, message: errorMessage };
  }
}
