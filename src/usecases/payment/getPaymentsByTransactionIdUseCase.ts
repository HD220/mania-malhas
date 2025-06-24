import { db } from "@/db/postgres";
import { paymentRepository } from "@/db/repositories/paymentRepository";
import { SelectPayment } from "@/features/payment/schemas/paymentSchema";

/**
 * Fetches all payments associated with a specific transaction ID.
 *
 * This use case interacts with the payment repository to retrieve a list of payments.
 * It includes a basic check for a falsy `transactionId` (e.g., empty string, null, undefined),
 * in which case it logs a warning and returns an empty array. This prevents unnecessary
 * repository calls with clearly invalid IDs.
 *
 * @param {string} transactionId - The ID of the transaction for which to fetch payments.
 * @returns {Promise<SelectPayment[]>} A promise that resolves to an array of `SelectPayment` objects.
 *                                     Returns an empty array if no payments are found for the given transaction ID,
 *                                     or if the provided `transactionId` is considered invalid by the initial check.
 * @throws {Error} If there's an issue with the repository during data retrieval (and the `transactionId` was valid).
 */
export default async function getPaymentsByTransactionIdUseCase(
  transactionId: string
): Promise<SelectPayment[]> {
  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
    console.warn(`getPaymentsByTransactionIdUseCase called with invalid transactionId: '${transactionId}'`);
    return [];
  }
  const repo = paymentRepository(db);
  const payments = await repo.findByTransactionId(transactionId);
  return payments;
}
