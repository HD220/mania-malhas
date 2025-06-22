import { db } from "@/db/postgres";
import {
  transactionRepository as createTransactionRepository,
  TransactionRepositoryFactory
} from "@/db/repositories/transactionRepository";
import {
  InsertTransaction,
  SelectTransaction,
  insertTransactionSchema
} from "@/db/repositories/schemas/transactionSchema";
import { z, ZodError } from "zod"; // Import z
import { NotFoundError } from "@/lib/errors/domainErrors";

/**
 * Input data type for updating a transaction.
 * All fields are optional.
 */
// Define updateTransactionSchema explicitly for robust validation, especially enums
export const updateTransactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória.").optional(),
  value: z.coerce.number({invalid_type_error: "Valor deve ser um número."}).positive("Valor deve ser positivo.").optional(),
  type: z.enum(["E", "S"], {errorMap: () => ({message: "Tipo deve ser 'E' (Entrada) ou 'S' (Saída)."})}).optional(),
  status: z.enum(["Pendente", "Pago", "Cancelado"], {errorMap: () => ({message: "Status inválido."})}).optional(),
  partnerId: z.string().uuid("ID do Parceiro inválido.").optional(),
  date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  transactionId: z.string().uuid("ID da Transação de origem inválido.").nullable().optional(),
}).partial(); // Using .partial() on an explicitly defined object makes all fields optional.

export type UpdateTransactionInput = z.input<typeof updateTransactionSchema>;


/**
 * @description Use case for updating an existing transaction.
 * Phase 1: Fetches the transaction, validates the input data.
 * (Actual update persistence will be in a subsequent phase/task UC-TX-UPDATE.2)
 *
 * @param {string} id - The ID of the transaction to update.
 * @param {UpdateTransactionInput} transactionUpdateData - The data to update.
 * @param {TransactionRepositoryFactory} [transactionRepoFactory=createTransactionRepository] - Optional factory for transaction repository.
 * @returns {Promise<SelectTransaction>} The existing transaction if found and data is valid (pending actual update).
 * @throws {NotFoundError} If the transaction with the given ID is not found.
 * @throws {ZodError} If input data validation fails.
 * @throws {Error} If there's an issue with the repository or other unexpected errors.
 */
export default async function updateTransactionUseCase(
  id: string,
  transactionUpdateData: UpdateTransactionInput,
  transactionRepoFactory: TransactionRepositoryFactory = createTransactionRepository
): Promise<SelectTransaction> {

  const transactionRepo = transactionRepoFactory(db);

  // 1. Fetch the existing transaction
  const existingTransaction = await transactionRepo.findById(id);
  if (!existingTransaction) {
    throw new NotFoundError("Transação não encontrada.");
  }

  // 2. Validate input data for update
  // Ensure only fields present in transactionUpdateData are validated against their schema rules.
  // `partial()` makes all fields optional. If a field is provided, it must match its type.
  updateTransactionSchema.parse(transactionUpdateData);

  // For UC-TX-UPDATE.1, we just return the existing transaction after validation.
  // The actual update logic will be in UC-TX-UPDATE.2.
  return existingTransaction;
}
