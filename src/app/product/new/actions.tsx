"use server";

import { db } from "@/db/postgres";
import { productTable } from "@/db/postgres/schema/product";
import {
  InsertProductWithImage,
  insertProductWithImageSchema,
  productImageTable,
} from "@/db/postgres/schema/productImage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProduct(data: InsertProductWithImage) {
  const validation = insertProductWithImageSchema.safeParse(data);

  if (validation.success) {
    const product = await db.transaction(async (tx) => {
      const [{ id: productId }] = await tx
        .insert(productTable)
        .values({
          name: data.name,
          description: data.description,
          price: data.price,
        })
        .returning({ id: productTable.id });

      const insertImages = data.images?.map((image) =>
        tx.insert(productImageTable).values({
          productId,
          name: image.name,
          s3name: image.s3name,
          size: image.size,
          type: image.type,
          url: image.url,
        })
      );

      if (insertImages) await Promise.all(insertImages);

      // return productId;
    });

    revalidatePath("/products");
    redirect("/products");
  } else {
    console.log("dados:", data);
    console.log(validation.error.flatten());
  }
}
