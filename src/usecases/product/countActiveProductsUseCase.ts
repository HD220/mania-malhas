import { db } from "@/db/postgres";
import { productRepository } from "@/features/product/db/productRepository";

/**
 * Counts the number of active products in the system.
 *
 * This use case interacts with the product repository to fetch all active products
 * and then returns the count of this collection.
 *
 * @returns {Promise<number>} A promise that resolves to the total number of active products.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function countActiveProductsUseCase(): Promise<number> {
  const repo = productRepository(db);
  const activeProducts = await repo.findAll(true); // findAll(status = true)
  return activeProducts.length;
}
