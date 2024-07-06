"use server";

import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/db/repositories/schemas/productImageSchema";
import alterProductUseCase from "@/usecases/product/alterProductUseCase";
import getProductByIdUseCase from "@/usecases/product/getProductByIdUseCase";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

export async function getProductWithImagesById(id: string) {
  noStore();

  return await getProductByIdUseCase({ id });
}

export async function updateProduct({
  id,
  ...data
}: InsertProductWithImages): Promise<void> {
  if (!id) throw new Error("Id to be defined!");
  const validation = insertProductWithImagesSchema.parse(data);

  await alterProductUseCase(id, validation);

  revalidatePath("/products");
  redirect("/products");
}
