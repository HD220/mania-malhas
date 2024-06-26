"use server";

import { db } from "@/db/postgres";
import { productTable } from "@/db/postgres/schema/product";
import {
  SelectProductWithImage,
  productImageTable,
} from "@/db/postgres/schema/productImage";
import { eq } from "drizzle-orm";
import { unstable_noStore as noCache } from "next/cache";

export async function getProductsWithImages(): Promise<
  SelectProductWithImage[]
> {
  noCache();

  const products = await db
    .select({
      id: productTable.id,
      name: productTable.name,
      description: productTable.description,
      price: productTable.price,
      createdAt: productTable.createdAt,
      updatedAt: productTable.updatedAt,
    })
    .from(productTable);
  // .where(eq(productTable.id, id));

  const productWithImages = Promise.all(
    products.map(async (product) => {
      const images = await db
        .select()
        .from(productImageTable)
        .where(eq(productImageTable.productId, product.id));

      return {
        ...product,
        images,
      };
    })
  );

  return productWithImages;
}
