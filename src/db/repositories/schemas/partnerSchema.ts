import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { partnerTable } from "../../postgres/schema/partner";

export const insertPartnerSchema = createInsertSchema(partnerTable, {}).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertPartner = z.input<typeof insertPartnerSchema>;

export const selectPartnerSchema = createSelectSchema(partnerTable, {});
export type SelectPartner = z.input<typeof selectPartnerSchema>;
