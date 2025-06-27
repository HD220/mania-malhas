import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { partnerTable } from "@/features/partner/db/schema"; // Updated path

export const insertPartnerSchema = createInsertSchema(partnerTable, {
  name: z.string().min(1, "Nome é obrigatório"), // Added error message
  phone: z
    .string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos") // Added min length and message
    .max(11, "Telefone deve ter no máximo 11 dígitos") // Added max length and message
    .refine(
      (value) => /^\d+$/.test(value), // Ensure only digits
      "Telefone deve conter apenas números"
    ).optional().or(z.literal("")), // Allow empty string or make it optional
  notes: z.string().optional(), // Made notes optional as per DB schema
  active: z.boolean().optional().default(true), // Added active as per DB schema
}).omit({
  // id: true, // ID is usually omitted for inserts unless client-generated
  createdAt: true,
  updatedAt: true,
});
export type InsertPartner = z.input<typeof insertPartnerSchema>;

export const selectPartnerSchema = createSelectSchema(partnerTable, {});
export type SelectPartner = z.infer<typeof selectPartnerSchema>; // Changed from z.input to z.infer for select types
