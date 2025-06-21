import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import {
  insertProductWithImagesSchema,
  InsertProductImage,
  SelectProductImage, // For fetching existing images
} from "@/db/repositories/schemas/productImageSchema";
import { z } from "zod";
import { deleteObject } from "@/services/minio"; // Import the new deleteObject function

const productUpdateDataSchema = insertProductWithImagesSchema.omit({ id: true });
type ProductUpdateData = z.infer<typeof productUpdateDataSchema>;

const MINIO_PRODUCT_BUCKET_NAME = "products"; // Define bucket name, consider making this an env var

function getObjectNameFromUrl(url: string): string {
  // Removes query parameters and then gets the last part of the path
  const path = new URL(url).pathname;
  return path.substring(path.lastIndexOf('/') + 1);
}

export default async function alterProductUseCase(
  productIdToUpdate: string,
  inputData: ProductUpdateData
): Promise<void | { errors: string[] }> {
  const validationResult = productUpdateDataSchema.safeParse(inputData);

  if (!validationResult.success) {
    return { errors: validationResult.error.issues.map((err) => err.message) };
  }

  const { images: inputImages, ...productDataToUpdate } = validationResult.data;

  await db.transaction(async (tx) => {
    const repo = productRepository(tx);

    // 1. Fetch current active images for the product (before any updates)
    const originalDbImages = await repo.findActiveProductImagesByProductId(productIdToUpdate);
    const originalImageIds = new Set(originalDbImages.map(img => img.id));

    // 2. Update the product's own data
    await repo.updateProduct(productIdToUpdate, productDataToUpdate);

    const processedImageIds = new Set<string>();

    // 3. Process images from input: add new, update existing, or mark for deletion
    if (inputImages) {
      for (const imgData of inputImages) {
        if (imgData.id) { // Existing image
          processedImageIds.add(imgData.id);
          if (imgData.active === false) {
            // Image explicitly marked for deletion by the form
            const imageToDelete = originalDbImages.find(dbImg => dbImg.id === imgData.id);
            if (imageToDelete) {
              try {
                const objectName = getObjectNameFromUrl(imageToDelete.url);
                await deleteObject(MINIO_PRODUCT_BUCKET_NAME, objectName);
              } catch (s3Error) {
                console.error(`Failed to delete image ${imageToDelete.url} from S3:`, s3Error);
                // Decide on error handling: continue and delete from DB? Or rollback transaction?
                // For now, log and continue to delete from DB. Critical apps might rollback.
              }
            }
            await repo.deleteProductImage(imgData.id);
          } else { // imgData.active === true or undefined (treat as true)
            // Update existing image if its data (e.g. URL from re-upload, name) changed
            const { id, productId, createdAt, updatedAt, active, ...dataToUpdate } = imgData;
            await repo.updateProductImage(imgData.id, { ...dataToUpdate, active: true });
          }
        } else if (imgData.active === true) { // New image to insert
          const newImageData: Omit<InsertProductImage, "id" | "createdAt" | "updatedAt"> = {
            productId: productIdToUpdate,
            name: imgData.name,
            url: imgData.url, // This URL should be the final S3 URL after upload
            active: true,
          };
          const {id: newImageId} = await repo.insertProductImage(newImageData);
          processedImageIds.add(newImageId); // Track newly added images
        }
      }
    }

    // 4. Identify and delete orphan images (were in DB, not in input, and were active)
    for (const originalDbImage of originalDbImages) {
      if (!processedImageIds.has(originalDbImage.id)) {
        // This image was in the DB but not in the latest submission's active images
        // (or it wasn't submitted at all, meaning it was removed from the UI).
        // This also covers images that were active and user removed from form.
        try {
          const objectName = getObjectNameFromUrl(originalDbImage.url);
          await deleteObject(MINIO_PRODUCT_BUCKET_NAME, objectName);
        } catch (s3Error) {
          console.error(`Failed to delete orphan image ${originalDbImage.url} from S3:`, s3Error);
          // Log and continue
        }
        await repo.deleteProductImage(originalDbImage.id);
      }
    }
  });
}
