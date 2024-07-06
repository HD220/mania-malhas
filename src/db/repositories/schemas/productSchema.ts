import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { productTable } from "../../postgres/schema/product";

export const insertProductSchema = createInsertSchema(productTable, {
  price: z.coerce.number().positive(),
  // description: z.string().nullish(),
}).omit({ createdAt: true, updatedAt: true });
export type InsertProduct = z.input<typeof insertProductSchema>;

export const selectProductSchema = createSelectSchema(productTable, {
  price: z.coerce.number().positive(),
  // description: z.string().nullish(),
});
export type SelectProduct = z.input<typeof selectProductSchema>;
