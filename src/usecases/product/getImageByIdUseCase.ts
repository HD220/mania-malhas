import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
// import { minioClient } from "@/services/minio"; // No longer needed for this use case

export default async function getImageByIdUseCase({
  productId,
  imageId,
}: {
  productId: string;
  imageId: string;
}) {
  // The repository's findImageById method should return the image data
  // with the 'url' field already being the public, permanent URL.
  const image = await productRepository(db).findImageById(productId, imageId);

  // No need to generate a presigned URL if the stored URL is public.
  // If image is not found, productRepository(db).findImageById now returns null.
  return image;
}
