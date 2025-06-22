import {
  boolean,
  decimal,
  pgTable,
  // serial, // Removido serial pois não está sendo usado
  text,
  timestamp,
  uuid,
  varchar,
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
