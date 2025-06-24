import { db } from "@/db/postgres";
import {
  transactionRepository as createTransactionRepository,
  TransactionRepositoryFactory
} from "@/features/transaction/db/transactionRepository";
import {
  InsertTransaction,
  SelectTransaction,
  insertTransactionSchema // Not directly used, but good for context if schema evolves
} from "@/features/transaction/schemas/transactionSchema";
import { z, ZodError } from "zod";
import { NotFoundError } from "@/lib/errors/domainErrors";

export const updateTransactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória.").optional(),
  value: z.coerce.number({invalid_type_error: "Valor deve ser um número."}).positive("Valor deve ser positivo.").optional(),
  type: z.enum(["E", "S"], {errorMap: () => ({message: "Tipo deve ser 'E' (Entrada) ou 'S' (Saída)."})}).optional(),
  status: z.enum(["Pendente", "Pago", "Cancelado"], {errorMap: () => ({message: "Status inválido."})}).optional(),
  partnerId: z.string().uuid("ID do Parceiro inválido.").optional(),
  date: z.coerce.date().optional(),
  due_date: z.coerce.date().optional(),
  transactionId: z.string().uuid("ID da Transação de origem inválido.").nullable().optional(),
}).partial();

export type UpdateTransactionInput = z.input<typeof updateTransactionSchema>;

export default async function updateTransactionUseCase(
  id: string,
  transactionUpdateData: UpdateTransactionInput,
  transactionRepoFactory: TransactionRepositoryFactory = createTransactionRepository
): Promise<SelectTransaction> {

  const transactionRepo = transactionRepoFactory(db);

  const existingTransaction = await transactionRepo.findById(id);
  if (!existingTransaction) {
    throw new NotFoundError("Transação não encontrada.");
  }

  const parsedInput = updateTransactionSchema.parse(transactionUpdateData);

  const dataToActuallyUpdate: Record<string, any> = {};
  for (const key in parsedInput) {
    if (parsedInput[key as keyof typeof parsedInput] !== undefined) {
      dataToActuallyUpdate[key] = parsedInput[key as keyof typeof parsedInput];
    }
  }

  if (Object.keys(dataToActuallyUpdate).length > 0) {
    await transactionRepo.update(id, dataToActuallyUpdate as Partial<InsertTransaction>);

    const updatedTransaction = await transactionRepo.findById(id);
    if (!updatedTransaction) {
      throw new Error("Falha ao buscar a transação após a atualização.");
    }
    return updatedTransaction;
  }

  return existingTransaction;
}
