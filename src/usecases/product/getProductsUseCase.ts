import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import { SelectProductWithImages } from "@/db/repositories/schemas/productImageSchema";

/**
 * Fetches products based on a search term and their status (active/inactive).
 *
 * This use case allows for searching products by matching the search term against
 * relevant product fields (e.g., name, description) and filtering by the product's
 * active status. Image URLs within the returned products are expected to be public
 * and permanent.
 *
 * @param {string} search - The search term to filter products by. If empty, it may return all products matching the status.
 * @param {boolean} status - The status of the products to fetch (true for active, false for inactive).
 * @returns {Promise<SelectProductWithImages[]>} A promise that resolves to an array of products
 *                                              matching the search criteria and status. Returns an
 *                                              empty array if no matching products are found.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function getProductsUseCase(
  search: string,
  status: boolean
): Promise<SelectProductWithImages[]> {
  const repo = productRepository(db);
  // The repository's findBySearch method should return products with image URLs
  // already being the public, permanent URLs.
  const products = await repo.findBySearch(search, status);

  return products;
}
