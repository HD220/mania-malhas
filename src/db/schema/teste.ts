import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const testeTable = pgTable("teste", {
  id: serial("id").primaryKey(),
});

export type InsertTeste = typeof testeTable.$inferInsert;
export type SelectTeste = typeof testeTable.$inferSelect;
