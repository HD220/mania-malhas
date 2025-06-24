import { db } from "@/db/postgres";
import {
  transactionRepository as createTransactionRepository,
  TransactionRepositoryFactory,
} from "@/features/transaction/db/transactionRepository";
import { SelectTransaction } from "@/features/transaction/schemas/transactionSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";
import { z } from "zod";

export const getTransactionByIdInputSchema = z.object({
  id: z.string().uuid("ID da transação inválido."),
});

export type GetTransactionByIdInput = z.infer<typeof getTransactionByIdInputSchema>;

/**
 * @description Use case for fetching a single transaction by its ID.
 * It validates the input ID and uses the transaction repository to find the transaction.
 *
 * @param {GetTransactionByIdInput} input - The input containing the transaction ID.
 * @param {TransactionRepositoryFactory} [transactionRepoFactory=createTransactionRepository] - Optional factory for transaction repository.
 * @returns {Promise<SelectTransaction>} The found transaction.
 * @throws {ZodError} If input data validation fails.
 * @throws {NotFoundError} If the transaction with the given ID is not found.
 * @throws {Error} If there's an issue with the repository or other unexpected errors.
 */
export default async function getTransactionByIdUseCase(
  input: GetTransactionByIdInput,
  transactionRepoFactory: TransactionRepositoryFactory = createTransactionRepository
): Promise<SelectTransaction> {
  const { id } = getTransactionByIdInputSchema.parse(input);

  const transactionRepo = transactionRepoFactory(db);
  const transaction = await transactionRepo.findById(id);

  if (!transaction) {
    throw new NotFoundError(`Transação com ID ${id} não encontrada.`);
  }

  return transaction;
}
