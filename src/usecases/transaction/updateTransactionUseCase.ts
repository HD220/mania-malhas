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
  // Validate and get potentially sparse data (with undefined for non-provided fields)
  const parsedInput = updateTransactionSchema.parse(transactionUpdateData);

  // Filter out undefined values to determine if an update is truly needed
  const dataToActuallyUpdate: Record<string, any> = {};
  for (const key in parsedInput) {
    if (parsedInput[key as keyof typeof parsedInput] !== undefined) {
      dataToActuallyUpdate[key] = parsedInput[key as keyof typeof parsedInput];
    }
  }

  // For UC-TX-UPDATE.2: Actual update logic
  // Note for UC-TX-UPDATE.3: Complex interactions with payments (e.g., if value/status changes significantly)
  // are NOT handled here to keep this step's complexity manageable.
  // Such logic would require further analysis and potentially new UCs or adjustments.
  // Current approach: Update transaction fields directly. Caller/UI should be aware of implications.
  if (Object.keys(dataToActuallyUpdate).length > 0) { // Only update if there's actual data
    await transactionRepo.update(id, dataToActuallyUpdate as Partial<InsertTransaction>);

    // 3. Fetch and return the updated transaction
    const updatedTransaction = await transactionRepo.findById(id);
    if (!updatedTransaction) {
      // This would be highly unexpected if the update call didn't throw and ID is correct
      throw new Error("Falha ao buscar a transação após a atualização.");
    }
    return updatedTransaction;
  }

  // If no actual data was provided for update, return the existing transaction.
  return existingTransaction;
}
