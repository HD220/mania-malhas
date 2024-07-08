import { decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { transactionTable } from "./transaction";

export const paymentTable = pgTable(
  "payment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionId: uuid("transactionId").notNull(),
    // description: varchar("description", { length: 100 }),
    value: decimal("amount", { precision: 16, scale: 7 })
      .notNull()
      .$type<number>(),
    date: timestamp("date", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
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
        columns: [table.transactionId],
        foreignColumns: [transactionTable.id],
        name: "fk_transaction",
      },
    };
  }
);
