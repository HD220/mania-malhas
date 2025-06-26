import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { paymentTable } from "@/features/payment/db/schema"; // Updated path

// Schema for inserting payments
export const insertPaymentSchema = createInsertSchema(paymentTable, {
  // Override default Zod types or add specific validations here if needed
  transactionId: z.string().uuid("ID da Transação inválido."),
  value: z.coerce
    .number({ invalid_type_error: "Valor deve ser um número." })
    .positive("Valor deve ser positivo.")
    .multipleOf(0.01, { message: "Valor deve ter no máximo 2 casas decimais." }), // Assuming 2 decimal places for currency
  date: z.coerce.date().optional(), // Date can be optional, defaults in DB or use case
}).omit({ id: true, createdAt: true, updatedAt: true }); // Omit auto-generated fields

export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Schema for selecting payments (reflects the table structure)
export const selectPaymentSchema = createSelectSchema(paymentTable);
export type SelectPayment = z.infer<typeof selectPaymentSchema>;
