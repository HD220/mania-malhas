import { db } from "@/db/postgres";
import { productRepository } from "@/features/product/db/productRepository";
import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "@/features/product/schemas/productImageSchema";
import { ZodError } from "zod";

/**
 * Alters an existing product with the provided data, including its images.
 *
 * This use case is responsible for:
 * 1. Validating the input data against the `insertProductWithImagesSchema`.
 * 2. Interacting with the product repository to update the product and its associated images.
 *
 * @param {string} id - The ID of the product to be altered.
 * @param {InsertProductWithImages} input - The product data including images to update the product with.
 *   - `name`: Name of the product.
 *   - `price`: Price of the product.
 *   - `active`: Status of the product.
 *   - `description` (optional): Description of the product.
 *   - `images` (optional): Array of images associated with the product. Each image should have `name` and `url`.
 *                           The repository's update logic should handle image additions/removals/updates.
 * @returns {Promise<any>} A promise that resolves to the result of the repository's update operation
 *                         (the specific return type depends on the repository implementation, often the updated product or a status).
 * @throws {ZodError} If the input data fails validation.
 * @throws {Error} If the product with the given ID is not found, or if there's another issue
 *                 with the repository during data persistence.
 */
export default async function alterProductUseCase(
  id: string,
  input: InsertProductWithImages
) {
  const validationResult = insertProductWithImagesSchema.safeParse(input);
  if (!validationResult.success) {
    throw validationResult.error; // Throw the ZodError directly
  }

  const repo = productRepository(db);
  // The repository's update method is expected to handle the logic for
  // updating the product and its images (e.g., adding new images, removing old ones, updating existing ones).
  // It should also handle cases where the product ID does not exist.
  return await repo.update(id, validationResult.data);
}
