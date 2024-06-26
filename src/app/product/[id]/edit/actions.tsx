"use server";

import { db } from "@/db/postgres";
import { productTable } from "@/db/postgres/schema/product";
import {
  InsertProductWithImage,
  productImageTable,
  selectProductWithImageSchema,
} from "@/db/postgres/schema/productImage";
import { eq } from "drizzle-orm";
import { unstable_noStore as noCache } from "next/cache";

export async function getProductsWithImagesById(id: number) {
  noCache();

  const productQ = db
    .select({
      id: productTable.id,
      name: productTable.name,
      description: productTable.description,
      price: productTable.price,
      createdAt: productTable.createdAt,
      updatedAt: productTable.updatedAt,
    })
    .from(productTable)
    .where(eq(productTable.id, id));

  const imagesQ = db
    .select()
    .from(productImageTable)
    .where(eq(productImageTable.productId, id));

  const [[product], images] = await Promise.all([productQ, imagesQ]);

  const coersed = selectProductWithImageSchema.safeParse({
    ...product,
    images,
  });

  if (!coersed.success) throw coersed.error;

  return coersed.data;
}

export async function updateProduct(
  data: InsertProductWithImage
): Promise<void> {
  console.log("updateProduct recebidos", data);
}
