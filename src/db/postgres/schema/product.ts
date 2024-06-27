import {
  boolean,
  decimal,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const productTable = pgTable("product", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 16, scale: 7 })
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

export const insertProductSchema = createInsertSchema(productTable, {
  price: z.coerce.number().positive(),
});
export type InsertProduct = z.input<typeof insertProductSchema>;

export const selectProductSchema = createSelectSchema(productTable, {
  price: z.coerce.number().positive(),
});
export type SelectProduct = z.input<typeof selectProductSchema>;
