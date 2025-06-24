import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository } from "@/features/transaction/db/transactionRepository";

/**
 * Defines the structure for statistics about pending transactions.
 */
interface PendingTransactionsStats {
  /** The total number of pending transactions. */
  count: number;
  /** The sum of the values of all pending transactions. */
  totalValue: number;
}

/**
 * Fetches statistics about 'Pendente' (Pending) transactions.
 *
 * This use case retrieves all transactions currently marked with the status 'Pendente'.
 * It then calculates:
 * - `count`: The total number of such pending transactions.
 * - `totalValue`: The sum of the 'value' for all these pending transactions.
 *
 * The actual filtering by status 'Pendente' is handled by the `findAll` method
 * of the transaction repository.
 *
 * @returns {Promise<PendingTransactionsStats>} An object containing the `count` and `totalValue`
 *                                             of pending transactions. `totalValue` is a number.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function getPendingTransactionsStatsUseCase(): Promise<PendingTransactionsStats> {
  const transactionRepo = createTransactionRepository(db);

  // Define the filter for pending transactions.
  const filters = { status: "Pendente" };

  const pendingTransactions = await transactionRepo.findAll(filters);

  let totalValue = 0;
  for (const transaction of pendingTransactions) {
    totalValue += parseFloat(transaction.value as unknown as string);
  }

  return {
    count: pendingTransactions.length,
    totalValue: totalValue,
  };
}
