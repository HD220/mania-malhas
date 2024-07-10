import {
  AnyForeignKeyBuilder,
  AnyPgColumn,
  char,
  decimal,
  foreignKey,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { partnerTable } from "./partner";

export const transactionTable = pgTable("transaction", {
  id: uuid("id").defaultRandom().primaryKey(),
  partnerId: uuid("partnerId")
    .references((): AnyPgColumn => partnerTable.id)
    .notNull(),
  description: varchar("description", { length: 100 }),
  type: char("type", ["E", "S"]).notNull(),
  value: decimal("value", { precision: 16, scale: 7 })
    .notNull()
    .$type<number>(),
  date: timestamp("date", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  due_date: timestamp("due_date", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
  transactionId: uuid("transactionId").references(
    (): AnyPgColumn => transactionTable.id
  ),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
