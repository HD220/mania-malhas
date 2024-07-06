import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/db/repositories/schemas/productImageSchema";

export default async function alterProductUseCase(
  id: string,
  input: InsertProductWithImages
) {
  const parsed = insertProductWithImagesSchema.safeParse(input);
  if (parsed.success) {
    const repo = productRepository(db);
    return await repo.update(id, parsed.data);
  }
  return { errors: parsed.error.issues.map((err) => err.message) };
}
