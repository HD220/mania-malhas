import { sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const testeTable = sqliteTable("teste", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
});

export type InsertTeste = typeof testeTable.$inferInsert;
export type SelectTeste = typeof testeTable.$inferSelect;
