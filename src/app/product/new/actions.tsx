"use server";

import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/db/repositories/schemas/productImageSchema";
import createProductUseCase from "@/usecases/product/createProductUseCase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(data: InsertProductWithImages) {
  const parsed = insertProductWithImagesSchema.parse(data);

  await createProductUseCase(parsed);

  revalidatePath("/products");
  redirect("/products");
}
