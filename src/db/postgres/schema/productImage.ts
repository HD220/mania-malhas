import {
  boolean,
  foreignKey,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { productTable } from "./product";

export const productImagesTable = pgTable(
  "productImage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("productId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 4000 }).notNull(),
    active: boolean("active").default(true).notNull(),
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
