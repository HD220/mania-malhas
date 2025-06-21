"use server";

import {
  InsertProductWithImages, // Type for the full product data including potential id
  insertProductWithImagesSchema, // Original schema
} from "@/db/repositories/schemas/productImageSchema";
import alterProductUseCase from "@/usecases/product/alterProductUseCase";
import getProductByIdUseCase from "@/usecases/product/getProductByIdUseCase";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function getProductWithImagesById(id: string) {
  noStore();
  return await getProductByIdUseCase({ id });
}

// Schema for data coming from the form, which should not include the product's own ID for update operations
const productUpdatePayloadSchema = insertProductWithImagesSchema.omit({ id: true });
type ProductUpdatePayload = z.infer<typeof productUpdatePayloadSchema>;

export async function updateProduct(
  productIdFromUrl: string,
  dataFromForm: ProductUpdatePayload
): Promise<void> { // Return type can be enhanced to include error feedback
  if (!productIdFromUrl) throw new Error("Product ID from URL must be defined!");

  // Validate the form data (which should not have 'id' at the root for the product itself)
  const validationResult = productUpdatePayloadSchema.safeParse(dataFromForm);

  if (!validationResult.success) {
    // Option 1: Throw a Zod error (or a custom validation error)
    // throw validationResult.error;
    // Option 2: Or, more gracefully for Server Actions called by forms, return error details
    // This requires changing the Promise<void> return type
    // For now, let's assume the use case will handle finer-grained validation errors if needed,
    // or this could be a point of refinement later.
    // For simplicity with the current plan, we'll let the use case handle it or throw.
    // However, the alterProductUseCase currently returns {errors: ...}, so this SA should align.
     throw new Error(validationResult.error.issues.map(issue => issue.message).join(', '));
  }

  // alterProductUseCase now expects (productId: string, inputData: ProductUpdateData)
  // validationResult.data is ProductUpdatePayload, which matches ProductUpdateData
  const useCaseResult = await alterProductUseCase(productIdFromUrl, validationResult.data);

  // Handle potential errors returned by alterProductUseCase
  // @ts-ignore TODO: Standardize error returns from use cases
  if (useCaseResult && useCaseResult.errors) {
    // @ts-ignore
    throw new Error(useCaseResult.errors.join(', '));
  }

  revalidatePath("/product/list");
  revalidatePath(`/product/${productIdFromUrl}/edit`); // Also revalidate the edit page itself
  redirect("/product/list");
}
