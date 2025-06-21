import { dbType, db as defaultDb } from "@/db/postgres";
import { paymentTable } from "@/db/postgres/schema/payment";
import { InsertPayment, SelectPayment } from "./schemas/paymentSchema";
import { eq, desc } from "drizzle-orm";

export type DBConnection = dbType["db"];

export type PaymentRepositoryFactory = (dbInstance?: DBConnection) => {
  insert: (data: InsertPayment) => Promise<{ id: string }>;
  findByTransactionId: (transactionId: string) => Promise<SelectPayment[]>;
  // TODO: Add update and delete methods later if needed
};

export const paymentRepository: PaymentRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  const insert = async (data: InsertPayment): Promise<{ id: string }> => {
    const [newPayment] = await db
      .insert(paymentTable)
      .values({
        ...data,
        date: data.date || new Date(), // Ensure date is set if not provided
      })
      .returning({ id: paymentTable.id });
    return newPayment;
  };

  const findByTransactionId = async (transactionId: string): Promise<SelectPayment[]> => {
    return await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.transactionId, transactionId))
      .orderBy(desc(paymentTable.date), desc(paymentTable.createdAt));
  };

  return {
    insert,
    findByTransactionId,
  };
};
