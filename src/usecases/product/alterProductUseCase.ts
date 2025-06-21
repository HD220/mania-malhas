import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/db/repositories/schemas/productImageSchema";
import { ZodError } from "zod"; // Import ZodError

export default async function alterProductUseCase(
  id: string,
  input: InsertProductWithImages
) {
  const validationResult = insertProductWithImagesSchema.safeParse(input);
  if (!validationResult.success) {
    throw validationResult.error; // Throw the ZodError directly
  }

  const repo = productRepository(db);
  return await repo.update(id, validationResult.data);
}
