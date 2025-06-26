import { decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
// Assuming transactionTable will be moved to its feature schema
import { transactionTable } from "@/features/transaction/db/schema";

export const paymentTable = pgTable(
  "payment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionId: uuid("transactionId").notNull(),
    // description: varchar("description", { length: 100 }),
    value: decimal("value", { precision: 10, scale: 2 }) // Ajustado para 10,2
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
