import { insertProductSchema, selectProductSchema } from "./productSchema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { productImagesTable } from "../../postgres/schema/productImage";

//Default for table
export const insertProductImagesSchema = createInsertSchema(
  productImagesTable
).omit({ createdAt: true, updatedAt: true });
export type InsertProductImage = z.input<typeof insertProductImagesSchema>;

//Default for table
export const selectProductImagesSchema = createSelectSchema(productImagesTable);
export type SelectProductImage = z.input<typeof selectProductImagesSchema>;

export const insertProductWithImagesSchema = insertProductSchema.merge(
  z.object({
    images: insertProductImagesSchema
      .omit({ productId: true })
      .array()
      .optional(),
  })
);
export type InsertProductWithImages = z.infer<
  typeof insertProductWithImagesSchema
>;

export const selectProductWithImagesSchema = selectProductSchema.merge(
  z.object({ images: selectProductImagesSchema.array() })
);
export type SelectProductWithImages = z.infer<
  typeof selectProductWithImagesSchema
>;
