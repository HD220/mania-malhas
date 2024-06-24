import {
  foreignKey,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { productTable } from "./product";

export const productImageTable = pgTable(
  "productImage",
  {
    id: serial("id").primaryKey(),
    productId: integer("productId").notNull(),
    s3name: varchar("s3name", { length: 65 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 15 }).notNull(),
    size: integer("size").notNull(),
    url: varchar("url", { length: 2000 }).notNull(),
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

export type InsertProductImage = typeof productImageTable.$inferInsert;
export type SelectProductImage = typeof productImageTable.$inferSelect;
