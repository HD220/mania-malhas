import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/db/repositories/schemas/productImageSchema";

export default async function createProductUseCase(
  input: InsertProductWithImages
) {
  const parsed = insertProductWithImagesSchema.parse(input);
  const repo = productRepository(db);
  return await repo.insert(parsed);
}
