import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
// import { getPresignedUrlGetObject } from "@/services/minio"; // No longer needed

export default async function getProductsUseCase(
  search: string,
  status: boolean
) {
  // The repository's findBySearch method should return products with image URLs
  // already being the public, permanent URLs.
  const products = await productRepository(db).findBySearch(search, status);

  // No need to iterate and generate presigned URLs for images.
  return products;
}
