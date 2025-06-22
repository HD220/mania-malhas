import { z } from "zod";
import { db } from "@/db/postgres";
import {
  transactionRepository as createTransactionRepository,
  TransactionRepositoryFactory
} from "@/db/repositories/transactionRepository";
import { NotFoundError } from "@/lib/errors/domainErrors";

/**
 * Schema for the input of the deleteTransactionUseCase.
 * Expects a transaction ID, which should be a UUID.
 */
export const deleteTransactionInputSchema = z.object({
  id: z.string().uuid("Invalid transaction ID format."),
});

export type DeleteTransactionInput = z.infer<typeof deleteTransactionInputSchema>;

/**
 * @description Use case for deleting a transaction.
 * It validates the input ID, then attempts to delete the transaction using the repository.
 *
 * @param {DeleteTransactionInput} input - The input containing the transaction ID.
 * @param {TransactionRepositoryFactory} [transactionRepoFactory=createTransactionRepository] - Optional factory for transaction repository.
 * @returns {Promise<{ success: true }>} An object indicating successful deletion.
 * @throws {ZodError} If input data validation fails.
 * @throws {NotFoundError} If the transaction with the given ID is not found.
 * @throws {Error} If there's an issue with the repository or other unexpected errors.
 */
export default async function deleteTransactionUseCase(
  input: DeleteTransactionInput,
  transactionRepoFactory: TransactionRepositoryFactory = createTransactionRepository
): Promise<{ success: true }> {
  // 1. Validate input data
  const { id } = deleteTransactionInputSchema.parse(input);

  const transactionRepo = transactionRepoFactory(db);

  // 2. Attempt to find the transaction first to ensure it exists before deletion
  // This helps in providing a more specific NotFoundError.
  // The actual deleteById in the repository might not throw if the record doesn't exist,
  // depending on its implementation (ours currently doesn't).
  const existingTransaction = await transactionRepo.findById(id);
  if (!existingTransaction) {
    throw new NotFoundError(`Transaction with ID ${id} not found.`);
  }

  // 3. Delete the transaction
  // Note: UC-TX-DELETE.2 will handle logic related to associated payments.
  // For now, this directly calls deleteById.
  await transactionRepo.deleteById(id);

  // 4. Return success
  return { success: true };
}
