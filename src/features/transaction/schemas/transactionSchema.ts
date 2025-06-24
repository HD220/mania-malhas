import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { transactionTable } from "@/db/postgres/schema/transaction"; // Adjusted import path

export const insertTransactionSchema = createInsertSchema(transactionTable, {
  description: z.string().min(1, "Descrição é obrigatória."),
  value: z.coerce.number({invalid_type_error: "Valor deve ser um número."}).positive("Valor deve ser positivo."),
  type: z.enum(["E", "S"], {errorMap: () => ({message: "Tipo deve ser 'E' (Entrada) ou 'S' (Saída)."})}),
  partnerId: z.string().uuid("ID do Parceiro inválido."),
  date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export const selectTransactionSchema = createSelectSchema(transactionTable, {
  value: z.coerce.number(),
});
export type SelectTransaction = z.infer<typeof selectTransactionSchema>;

export const selectTransactionWithPartnerSchema = selectTransactionSchema.extend({
  partnerName: z.string().optional(),
});
export type SelectTransactionWithPartner = z.infer<typeof selectTransactionWithPartnerSchema>;
