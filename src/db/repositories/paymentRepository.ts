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

/**
 * Factory function for creating a payment repository instance.
 * Contains methods for inserting and querying payment data.
 * @param {DBConnection} [dbInstance] - Optional Drizzle database connection instance. Uses a default if not provided.
 * @returns {Object} An object containing payment repository methods.
 */
export const paymentRepository: PaymentRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  /**
   * Inserts a new payment record into the database.
   * Ensures a date is set for the payment, defaulting to the current date if not provided.
   * @param {InsertPayment} data - The payment data to insert.
   * @returns {Promise<{ id: string }>} An object containing the ID of the newly created payment.
   */
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

  /**
   * Finds all payments associated with a specific transaction ID.
   * Orders payments by date (descending) and then by creation time (descending).
   * @param {string} transactionId - The UUID of the transaction.
   * @returns {Promise<SelectPayment[]>} A list of payments for the given transaction.
   */
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
