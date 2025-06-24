import { db } from "@/db/postgres";
import { productRepository } from "@/features/product/db/productRepository";
import { SelectProductWithImages } from "@/features/product/schemas/productImageSchema";

/**
 * Fetches a specific product by its ID, including its images.
 *
 * This use case interacts with the product repository to retrieve a product.
 * The repository's `findById` method is expected to return the product data
 * with image URLs already being public, permanent URLs.
 * It returns `null` if the product is not found or if the ID is invalid.
 *
 * @param {string} id - The ID of the product to fetch.
 * @returns {Promise<SelectProductWithImages | null>} A promise that resolves to the product data
 *                                                   (including images) or `null` if not found.
 * @throws {Error} If there's an issue with the repository during data retrieval,
 *                 other than not finding the product.
 */
export default async function getProductByIdUseCase(
  id: string
): Promise<SelectProductWithImages | null> {
  if (!id || typeof id !== 'string') {
    console.error("getProductByIdUseCase: ID inválido fornecido.");
    return null;
  }

  const repo = productRepository(db);
  const product = await repo.findById(id);

  // The repository's findById method now returns null if not found or on parse error.
  // The product object, if found, should have its images (if any) with public URLs.
  return product;
}
