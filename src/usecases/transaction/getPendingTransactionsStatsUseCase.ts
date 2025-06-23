import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository } from "@/db/repositories/transactionRepository";

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
  // The repository's findAll method is expected to handle this status filter.
  const filters = { status: "Pendente" };

  // Fetch all transactions that match the 'Pendente' status.
  // Pagination and ordering are not relevant for this aggregate calculation.
  const pendingTransactions = await transactionRepo.findAll(filters);

  let totalValue = 0;
  for (const transaction of pendingTransactions) {
    // The transaction.value is stored as a string in the schema and needs conversion.
    totalValue += parseFloat(transaction.value as unknown as string);
  }

  return {
    count: pendingTransactions.length,
    totalValue: totalValue, // This will be a number, formatting (e.g. toFixed(2)) should be done by the caller/UI if needed.
  };
}
