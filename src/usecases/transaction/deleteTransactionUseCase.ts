import { db } from "@/db/postgres";
import {
  transactionRepository as createTransactionRepository,
  TransactionRepositoryFactory
} from "@/db/repositories/transactionRepository";
import {
  paymentRepository as createPaymentRepository,
  PaymentRepositoryFactory
} from "@/db/repositories/paymentRepository";
import { NotFoundError, InvalidOperationError } from "@/lib/errors/domainErrors";

/**
 * @description Use case for deleting a transaction.
 * Implements a hard delete strategy.
 * Allows deletion only if there are no associated payments.
 *
 * @param {string} id - The ID of the transaction to delete.
 * @param {Object} [repositories] - Optional repository factories for testing.
 * @param {TransactionRepositoryFactory} [repositories.transactionRepoFactory=createTransactionRepository]
 * @param {PaymentRepositoryFactory} [repositories.paymentRepoFactory=createPaymentRepository]
 * @returns {Promise<void>}
 * @throws {NotFoundError} If the transaction with the given ID is not found.
 * @throws {InvalidOperationError} If the transaction has associated payments.
 * @throws {Error} If there's an issue with the repository or other unexpected errors.
 */
export default async function deleteTransactionUseCase(
  id: string,
  repositories?: {
    transactionRepoFactory?: TransactionRepositoryFactory,
    paymentRepoFactory?: PaymentRepositoryFactory
  }
): Promise<void> {
  const transactionRepo = repositories?.transactionRepoFactory?.(db) ?? createTransactionRepository(db);
  const paymentRepo = repositories?.paymentRepoFactory?.(db) ?? createPaymentRepository(db);

  // 1. Check if the transaction exists
  const existingTransaction = await transactionRepo.findById(id);
  if (!existingTransaction) {
    throw new NotFoundError("Transação não encontrada.");
  }

  // 2. Check for associated payments
  const associatedPayments = await paymentRepo.findByTransactionId(id);
  if (associatedPayments && associatedPayments.length > 0) {
    throw new InvalidOperationError(
      "Não é possível excluir transação pois existem pagamentos associados. Cancele ou desvincule os pagamentos primeiro."
    );
  }

  // 3. Perform hard delete
  await transactionRepo.deleteById(id);

  // No explicit return value for a successful deletion.
}
