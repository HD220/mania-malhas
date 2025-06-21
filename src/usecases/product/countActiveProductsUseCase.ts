import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";

/**
 * Counts the number of active products.
 * @returns Promise<number> The count of active products.
 */
export default async function countActiveProductsUseCase(): Promise<number> {
  const repo = productRepository(db);
  const activeProducts = await repo.findAll(true); // findAll(status = true)
  return activeProducts.length;
}
