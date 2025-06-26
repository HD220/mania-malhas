import {
  boolean,
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  foreignKey, // Added from productImage.ts
} from "drizzle-orm/pg-core";

export const productTable = pgTable("product", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }) // Ajustado para 10,2
    .notNull()
    .$type<number>(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const productImagesTable = pgTable(
  "productImage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("productId").notNull(), // References productTable.id
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
        foreignColumns: [productTable.id], // productTable is in scope
        name: "fk_produto",
      }),
    };
  }
);
