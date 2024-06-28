"use server";

import { db } from "@/db/postgres";
import { productTable } from "@/db/postgres/schema/product";
import { productImageTable } from "@/db/postgres/schema/productImage";
import { eq, and } from "drizzle-orm";
import { unstable_noStore as noCache } from "next/cache";

export async function getProductsWithImages() {
  noCache();

  const products = await db
    .select({
      id: productTable.id,
      name: productTable.name,
      description: productTable.description,
      price: productTable.price,
      active: productTable.active,
      createdAt: productTable.createdAt,
      updatedAt: productTable.updatedAt,
    })
    .from(productTable)
    .where(eq(productTable.active, true))
    .orderBy(productTable.id);

  const productWithImages = Promise.all(
    products.map(async (product) => {
      const images = await db
        .select()
        .from(productImageTable)
        .where(
          and(
            eq(productImageTable.productId, product.id),
            eq(productImageTable.active, true)
          )
        )
        .orderBy(productImageTable.id);

      return {
        ...product,
        images,
      };
    })
  );

  return productWithImages;
}
