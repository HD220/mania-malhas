import { insertProductSchema, selectProductSchema } from "./productSchema"; // Stays the same
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { productImagesTable } from "../../../db/postgres/schema/productImage"; // Adjusted path

//Default for table
const baseInsertProductImagesSchema = createInsertSchema(
  productImagesTable
).omit({ createdAt: true, updatedAt: true });

export const insertProductImagesSchema = baseInsertProductImagesSchema.extend({
  url: z.string().url({ message: "URL da imagem inválida." })
});
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
