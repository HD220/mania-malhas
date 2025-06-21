import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";
import {
  InsertProductWithImages, // This type includes the 'id' (optional) and 'images' array
  insertProductWithImagesSchema, // Schema for the full payload including images
  InsertProductImage, // Type for a single image to be inserted
} from "@/db/repositories/schemas/productImageSchema";
import { z } from "zod";

// Schema for the input data expected by this use case
// It's essentially InsertProductWithImages, but we ensure 'id' is not part of the product data itself for creation
const createProductInputSchema = insertProductWithImagesSchema.omit({ id: true });
type CreateProductInput = z.infer<typeof createProductInputSchema>;

export default async function createProductUseCase(
  input: CreateProductInput
): Promise<{ id: string }> {
  // Validate the entire input first
  const parsedInput = createProductInputSchema.parse(input);

  const { images, ...productData } = parsedInput;

  const newProduct = await db.transaction(async (tx) => {
    const repo = productRepository(tx); // Use the transaction instance with the repository

    // 1. Insert the product
    // productData should match ProductDataForInsert (Omit<InsertProduct, "id" | "createdAt" | "updatedAt">)
    // InsertProduct type (from productSchema) should be compatible if it's defined correctly
    const { id: productId } = await repo.insertProduct(productData);

    // 2. Insert images, if any
    if (images && images.length > 0) {
      for (const image of images) {
        // image should match Omit<InsertProductImage, "id" | "createdAt" | "updatedAt" | "productId">
        // We need to add productId to it.
        const imageData: Omit<InsertProductImage, "id" | "createdAt" | "updatedAt"> = {
            ...image, // name, url, active
            productId: productId,
        };
        await repo.insertProductImage(imageData);
      }
    }
    return { id: productId };
  });

  return newProduct;
}
