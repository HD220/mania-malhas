import {
  decimal,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { partnerTable } from "./partner";

export const transactionTable = pgTable(
  "transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    partnerId: uuid("partnerId").notNull(),
    description: varchar("description", { length: 100 }),
    value: decimal("amount", { precision: 16, scale: 7 })
      .notNull()
      .$type<number>(),
    date: timestamp("date", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    due_date: timestamp("due_date", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
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
      parentReference: {
        columns: [table.partnerId],
        foreignColumns: [partnerTable.id],
        name: "fk_partner",
      },
    };
  }
);
