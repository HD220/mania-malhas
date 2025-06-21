import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
// import { getPresignedUrlGetObject } from "@/services/minio"; // No longer needed if URLs are public

export default async function getProductByIdUseCase({ id }: { id: string }) {
  // The repository's findById method should return the product with image URLs
  // already being the public, permanent URLs.
  const product = await productRepository(db).findById(id);

  // No need to iterate and generate presigned URLs for images if they are public.
  // The product object from the repository should be ready to use.
  // Ensure that the 'images' array within the product object (if it exists)
  // has the correct public URLs.

  // If product is null (not found), it will be returned as such.
  // If product.images is null or empty, it will also be returned as is.
  return product;
}
