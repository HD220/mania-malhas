import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { partnerTable } from "../../postgres/schema/partner";

export const insertPartnerSchema = createInsertSchema(partnerTable, {
  name: z.string().min(1),
  phone: z
    .string()
    .refine(
      (value) => value.length === 10 || value.length === 11,
      "String must contain at least 10 or 11 character(s)"
    ),
}).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertPartner = z.input<typeof insertPartnerSchema>;

export const selectPartnerSchema = createSelectSchema(partnerTable, {});
export type SelectPartner = z.input<typeof selectPartnerSchema>;
