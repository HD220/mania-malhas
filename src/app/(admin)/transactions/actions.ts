"use server";

import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema";
import getTransactionsUseCase, { GetTransactionsFilters } from "@/usecases/transaction/getTransactionsUseCase";
import { unstable_noStore as noStore } from "next/cache";

// Definindo um tipo de resposta para consistência, similar a outras actions
export type TransactionServerResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  // Não estamos prevendo erros de Zod aqui, pois é uma leitura
};

export async function listTransactionsAction(
  filters?: GetTransactionsFilters
): Promise<TransactionServerResponse<SelectTransaction[]>> {
  noStore(); // Impede o cache da resposta desta action

  try {
    const transactions = await getTransactionsUseCase(filters);
    return { success: true, data: transactions };
  } catch (error: any) {
    console.error("listTransactionsAction Error:", error);
    return { success: false, message: error.message || "Erro ao buscar transações." };
  }
}

// Poderíamos adicionar actions para criar/atualizar/deletar transações aqui também, se necessário.
// Ex: createTransactionAction, updateTransactionStatusAction, etc.
