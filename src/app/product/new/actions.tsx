"use server";

import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/db/repositories/schemas/productImageSchema";
import createProductUseCase from "@/usecases/product/createProductUseCase";
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
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: error.flatten().fieldErrors, message: "Erro de validação nos dados fornecidos." };
    }
    // Para outros tipos de erro, logar e retornar mensagem genérica
    // Idealmente, erros específicos do use case (ex: falha no DB) poderiam ser tratados diferentemente
    let errorMessage = "Erro ao criar produto. Tente novamente.";
    if (error instanceof Error) {
      // Poderia logar error.message para o servidor, mas não expor diretamente ao cliente por segurança
      console.error("createProduct Server Action Error:", error.message);
      // Em alguns casos, você pode querer expor mensagens de erro específicas se forem seguras
      // errorMessage = error.message;
    } else {
      // Lidar com erros que não são instâncias de Error
      console.error("createProduct Server Action Unexpected Error:", error);
    }
    return { success: false, message: errorMessage };
  }
}
