import { db } from "@/db/postgres";
import { paymentRepository } from "@/db/repositories/paymentRepository";
import { SelectPayment } from "@/db/repositories/schemas/paymentSchema";

/**
 * Fetches all payments associated with a specific transaction ID.
 *
 * This use case interacts with the payment repository to retrieve a list of payments.
 * If the provided `transactionId` is falsy (e.g., empty string, null, undefined),
 * it returns an empty array.
 *
 * @param {string} transactionId - The ID of the transaction for which to fetch payments.
 * @returns {Promise<SelectPayment[]>} A promise that resolves to an array of payments.
 *                                     Returns an empty array if no payments are found for the transaction ID,
 *                                     or if the `transactionId` is invalid.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function getPaymentsByTransactionIdUseCase(
  transactionId: string
): Promise<SelectPayment[]> {
  if (!transactionId) {
    // Handles cases like empty string, null, or undefined transactionId by returning an empty list.
    // Alternatively, could throw an error for invalid input if that's preferred.
    console.warn("getPaymentsByTransactionIdUseCase called with invalid transactionId.");
    return [];
  }
  const repo = paymentRepository(db);
  const payments = await repo.findByTransactionId(transactionId);
  return payments;
}
