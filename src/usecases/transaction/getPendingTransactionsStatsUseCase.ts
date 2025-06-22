import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository } from "@/db/repositories/transactionRepository";

interface PendingTransactionsStats {
  count: number;
  totalValue: number;
}

/**
 * Fetches statistics about pending transactions, including their count and total value.
 *
 * @returns {Promise<PendingTransactionsStats>} An object containing the count and totalValue of pending transactions.
 */
export default async function getPendingTransactionsStatsUseCase(): Promise<PendingTransactionsStats> {
  const transactionRepo = createTransactionRepository(db);

  // Define o filtro para transações pendentes
  const filters = { status: "Pendente" };
  // A ordenação e paginação não são necessárias para este caso de uso de agregação.

  // O método findAll do repositório já aplica os filtros no DB.
  // E já retorna com partnerName (embora não usado aqui diretamente).
  const pendingTransactions = await transactionRepo.findAll(filters);

  let totalValue = 0;
  for (const transaction of pendingTransactions) {
    // transaction.value é string do schema, precisa ser convertido para número
    totalValue += parseFloat(transaction.value as unknown as string);
  }

  return {
    count: pendingTransactions.length,
    totalValue: totalValue,
  };
}
