import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import { SelectProductImage } from "@/db/repositories/schemas/productImageSchema";

/**
 * Fetches a specific product image by its ID and the product ID it belongs to.
 *
 * This use case interacts with the product repository to retrieve image data.
 * The repository's `findImageById` method is expected to return the image data
 * with the 'url' field already being a public, permanent URL.
 * It returns `null` if the image or product is not found.
 *
 * @param {object} params - The parameters for fetching the image.
 * @param {string} params.productId - The ID of the product the image belongs to.
 * @param {string} params.imageId - The ID of the image to fetch.
 * @returns {Promise<SelectProductImage | null>} A promise that resolves to the image data
 *                                              or `null` if not found.
 * @throws {Error} If there's an issue with the repository during data retrieval,
 *                 other than not finding the image.
 */
export default async function getImageByIdUseCase({
  productId,
  imageId,
}: {
  productId: string;
  imageId: string;
}): Promise<SelectProductImage | null> {
  const repo = productRepository(db);
  // The repository's findImageById method should return the image data
  // with the 'url' field already being the public, permanent URL.
  const image = await repo.findImageById(productId, imageId);

  // If image is not found, productRepository(db).findImageById now returns null.
  return image;
}
