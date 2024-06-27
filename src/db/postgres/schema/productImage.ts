import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  insertProductSchema,
  productTable,
  selectProductSchema,
} from "./product";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const productImageTable = pgTable(
  "productImage",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull(),
    s3name: varchar("s3name", { length: 65 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 15 }).notNull(),
    size: integer("size").notNull(),
    active: boolean("active").default(true).notNull(),
    url: varchar("url", { length: 2000 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      parentReference: foreignKey({
        columns: [table.productId],
        foreignColumns: [productTable.id],
        name: "fk_produto",
      }),
    };
  }
);

export const insertProductImageSchema = createInsertSchema(productImageTable);
export const selectProductImageSchema = createSelectSchema(productImageTable);

export const insertProductWithImageSchema = insertProductSchema.merge(
  z.object({
    images: z
      .object(insertProductImageSchema.partial({ productId: true }).shape)
      .merge(z.object({ progress: z.number().optional() }))
      .array()
      .nullish(),
  })
);

export const selectProductWithImageSchema = selectProductSchema.merge(
  z.object({
    images: z.object(selectProductImageSchema.shape).array().nullish(),
  })
);

export type InsertProductImage = z.input<typeof insertProductImageSchema>;
export type SelectProductImage = z.input<typeof selectProductImageSchema>;
export type InsertProductWithImage = z.input<
  typeof insertProductWithImageSchema
>;
export type SelectProductWithImage = z.input<
  typeof selectProductWithImageSchema
>;
