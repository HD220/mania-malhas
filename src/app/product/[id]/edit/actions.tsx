"use server";

import { db } from "@/db/postgres";
import { productTable } from "@/db/postgres/schema/product";
import {
  FormType,
  insertProductWithImageSchema,
  productImageTable,
} from "@/db/postgres/schema/productImage";
import { minioClient } from "@/services/minio";
import { and, eq, sql } from "drizzle-orm";
import { unstable_noStore as noCache, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProductWithImagesById(id: number) {
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
    .select({
      id: productImageTable.id,
      name: productImageTable.name,
      s3name: productImageTable.s3name,
      url: productImageTable.url,
      size: productImageTable.size,
      type: productImageTable.type,
      productId: productImageTable.productId,
      active: sql<boolean>`true`,
      progress: sql<number>`1`,
    })
    .from(productImageTable)
    .where(
      and(
        eq(productImageTable.productId, id),
        eq(productImageTable.active, true)
      )
    )
    .orderBy(productImageTable.id);

  const [[product], images] = await Promise.all([productQ, imagesQ]);

  const parse = insertProductWithImageSchema.safeParse({ ...product, images });
  if (!parse.success) throw parse.error;
  if (parse.success) return parse.data;
}

export async function updateProduct(data: FormType): Promise<void> {
  const validation = insertProductWithImageSchema.safeParse(data);

  if (validation.success) {
    const {
      images: imagesData,
      id: productId,
      createdAt,
      updatedAt,
      ...productData
    } = validation.data;

    await db
      .update(productTable)
      .set({
        ...productData,
      })
      .where(eq(productTable.id, productId!));

    imagesData?.forEach(
      async ({ progress, createdAt, updatedAt, ...image }) => {
        if (!image.active) {
          //deleta do s3
          await minioClient.removeObject(
            "uploads",
            `${image.s3name}.${image.type.split("/")[1]}`
          );
        }

        if (image.id) {
          await db
            .update(productImageTable)
            .set({
              ...image,
            })
            .where(
              and(
                eq(productImageTable.id, image.id!),
                eq(productImageTable.productId, productId!)
              )
            );
        } else {
          await db.insert(productImageTable).values({
            ...image,
            productId: productId!,
          });
        }
      }
    );

    revalidatePath("/products");
    redirect("/products");
  } else {
    console.log("dados:", data);
    console.log(validation.error.issues);
  }
}
