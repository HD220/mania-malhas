import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import { getPresignedUrlGetObject } from "@/services/minio";

export default async function getProductByIdUseCase({ id }: { id: string }) {
  const product = await productRepository(db).findById(id);
  const images = product?.images;
  return {
    ...product,
    images: images
      ? await Promise.all(
          product?.images?.map(async (image) => {
            const [fileName, bucketName] = image.url.split("/").reverse();
            return {
              ...image,
              progress: 1,
              url: await getPresignedUrlGetObject(
                bucketName,
                fileName,
                7 * 24 * 60 * 60
              ),
            };
          })
        )
      : [],
  };
}
