import { dbType } from "@/db/postgres";
import { and, eq, desc, or, ilike, sql } from "drizzle-orm";
import { InsertBill, SelectBill, selectBillSchema } from "./schemas/billSchema";
import { transactionTable } from "../postgres/schema/transaction";

export type DBConnection = dbType["db"];

export type BillRepository = (db: DBConnection) => {
  findAll: () => Promise<SelectBill[]>;
  findById: (id: string) => Promise<SelectBill>;
  update: (id: string, data: InsertBill) => Promise<void>;
  insert: (data: InsertBill) => Promise<{ id: string }>;
};

export const billRepository: BillRepository = (db) => {
  const findAll = async () => {
    const data = await db
      .select()
      .from(transactionTable)
      .orderBy(({ createdAt }) => [desc(createdAt)]);

    return data;
  };

  const findById = async (id: string) => {
    const data = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, id));

    const [result] = data;

    const parsed = selectBillSchema.safeParse(result);
    if (parsed.success) return parsed.data;

    throw parsed.error;
  };

  const update = async (id: string, { ...data }: InsertBill) => {
    await db
      .update(transactionTable)
      .set({
        ...data,
      })
      .where(eq(transactionTable.id, id));
  };

  const insert = async ({ ...data }: InsertBill) => {
    const [{ id }] = await db
      .insert(transactionTable)
      .values({
        ...data,
      })
      .returning({ id: transactionTable.id });

    return { id };
  };

  return {
    insert,
    update,
    findById,
    findAll,
  };
};
