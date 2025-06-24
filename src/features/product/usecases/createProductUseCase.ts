import { db } from "@/db/postgres";
import { productRepository } from "../db/productRepository"; // Adjusted
import {
  InsertProductWithImages,
  insertProductWithImagesSchema,
} from "../schemas/productImageSchema"; // Adjusted

/**
 * Creates a new product along with its associated images.
 *
 * This use case is responsible for:
 * 1. Validating the input data against the `insertProductWithImagesSchema`.
 * 2. Interacting with the product repository to persist the product and its images.
 *
 * @param {InsertProductWithImages} input - The product data including images to be created.
 *   - `name`: Name of the product.
 *   - `price`: Price of the product.
 *   - `active`: Status of the product.
 *   - `description` (optional): Description of the product.
 *   - `images` (optional): Array of images associated with the product. Each image should have `name` and `url`.
 * @returns {Promise<{ id: string }>} A promise that resolves to an object containing the ID of the newly created product.
 * @throws {ZodError} If the input data fails validation.
 * @throws {Error} If there's an issue with the repository during data persistence.
 */
export default async function createProductUseCase(
  input: InsertProductWithImages
): Promise<{ id: string }> {
  // Validate input data using Zod schema. This will throw a ZodError if validation fails.
  const parsedInput = insertProductWithImagesSchema.parse(input);

  const repo = productRepository(db);

  // Call the repository to insert the product and its images.
  // The repository is expected to handle the transactionality of creating a product and its images.
  const result = await repo.insert(parsedInput);

  return result;
}
