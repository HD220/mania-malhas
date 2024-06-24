import { decimal, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const productTable = pgTable("product", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 16, scale: 7 }).notNull(),
});

export type InsertProduct = typeof productTable.$inferInsert;
export type SelectProduct = typeof productTable.$inferSelect;
