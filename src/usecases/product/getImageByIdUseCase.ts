import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import { minioClient } from "@/services/minio";

export default async function getImageByIdUseCase({
  productId,
  imageId,
}: {
  productId: string;
  imageId: string;
}) {
  const image = await productRepository(db).findImageById(productId, imageId);
  const [fileName] = image.url.split("/").reverse();

  const url = await minioClient.presignedGetObject("products", fileName);

  return { ...image, url: url };
}
