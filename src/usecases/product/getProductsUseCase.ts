import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import { getPresignedUrlGetObject } from "@/services/minio";

export default async function getProductsUseCase(
  search: string,
  status: boolean
) {
  const products = await productRepository(db).findBySearch(search, status);
  console.log("usecase status: ", status);
  const presigneds = await Promise.all(
    products.map(async (product) => {
      return {
        ...product,
        images: await Promise.all(
          product.images.map(async (image) => {
            const [fileName, bucketName] = image.url.split("/").reverse();
            return {
              ...image,
              url: await getPresignedUrlGetObject(
                bucketName,
                fileName,
                7 * 24 * 60 * 60
              ),
            };
          })
        ),
      };
    })
  );
  return presigneds;
}
