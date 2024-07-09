import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { transactionTable } from "../../postgres/schema/transaction";

export const insertBillSchema = createInsertSchema(transactionTable, {
  description: z.string().min(1),
  value: z.coerce.number().positive(),
}).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertBill = z.input<typeof insertBillSchema>;

export const selectBillSchema = createSelectSchema(transactionTable, {
  value: z.coerce.number().positive(),
});
export type SelectBill = z.input<typeof selectBillSchema>;
