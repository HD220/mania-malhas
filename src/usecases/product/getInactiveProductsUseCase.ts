import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import { SelectProductWithImages } from "@/db/repositories/schemas/productImageSchema";

/**
 * Fetches all inactive products, including their images.
 *
 * This use case interacts with the product repository to retrieve products
 * that are marked as inactive (e.g., status is false).
 * Image URLs are expected to be public and permanent.
 *
 * @returns {Promise<SelectProductWithImages[]>} A promise that resolves to an array of inactive products,
 *                                              each including its images. Returns an empty array if no
 *                                              inactive products are found.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function getInactiveProductsUseCase(): Promise<SelectProductWithImages[]> {
  const repo = productRepository(db);
  const products = await repo.findAll(false); // false indicates inactive products

  return products;
}
