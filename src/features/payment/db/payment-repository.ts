import { eq, desc } from "drizzle-orm";

import { paymentTable } from "@/features/payment/db/schema";
import { InsertPayment, SelectPayment } from "@/features/payment/schemas/payment.schema";
import { dbType, db as defaultDb } from "@/lib/db-config/postgres";

/**
 * Type alias for the Drizzle database connection instance.
 */
export type DBConnection = dbType["db"];

/**
 * Defines the interface for a payment repository.
 * This factory function returns an object with methods to interact with payment data.
 * @param {DBConnection} [dbInstance] - Optional Drizzle database instance. If not provided, a default instance is used.
 * @returns {object} An object containing methods for payment data manipulation.
 */
export type PaymentRepositoryFactory = (dbInstance?: DBConnection) => {
  /**
   * Inserts a new payment into the database.
   * @param {InsertPayment} data - The payment data to insert.
   * @returns {Promise<{ id: string }>} The ID of the newly created payment.
   */
  insert: (data: InsertPayment) => Promise<{ id: string }>;
  /**
   * Finds all payments associated with a specific transaction ID.
   * @param {string} transactionId - The ID of the transaction.
   * @returns {Promise<SelectPayment[]>} A list of payments for the transaction.
   */
  findByTransactionId: (transactionId: string) => Promise<SelectPayment[]>;
  // TODO: Add update and delete methods later if needed
};

/**
 * Factory function for creating a payment repository instance.
 * This repository provides methods to interact with payment data in the database,
 * primarily for inserting new payments and retrieving payments associated with transactions.
 *
 * @param {DBConnection} [dbInstance] - Optional Drizzle database connection instance.
 *                                      If not provided, a default instance is used.
 * @returns {ReturnType<PaymentRepositoryFactory>} An object containing payment repository methods.
 */
export const paymentRepository: PaymentRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  /**
   * Inserts a new payment record into the database.
   * If the `date` field in the input data is not provided, it defaults to the current date.
   *
   * @async
   * @function insert
   * @param {InsertPayment} data - The payment data to insert.
   * @returns {Promise<{ id: string }>} A promise that resolves to an object containing the ID of the newly created payment.
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
