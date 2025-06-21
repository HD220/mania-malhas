import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository, TransactionWithPartner } from "@/db/repositories/transactionRepository"; // Import TransactionWithPartner
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema"; // SelectTransaction ainda pode ser útil para outros contextos

// Tipos para filtros (podem ser expandidos)
export interface GetTransactionsFilters {
  status?: string;
  type?: "E" | "S";
  partnerId?: string; // Filtro por partnerId ainda pode ser útil
  dateFrom?: Date;
  dateTo?: Date;
  // TODO: Adicionar paginação e ordenação
}

export default async function getTransactionsUseCase(
  filters?: GetTransactionsFilters // GetTransactionsFilters da UI pode ser diferente de TransactionFiltersForRepo
): Promise<TransactionWithPartner[]> {
  const transactionRepo = createTransactionRepository(db);

  // Mapear filtros da UI para filtros do repositório, se necessário.
  // Por enquanto, os nomes (type, status) coincidem.
  // Outros filtros como dateFrom, dateTo, partnerId ainda não estão implementados no repositório.
  const repoFilters: import("@/db/repositories/transactionRepository").TransactionFiltersForRepo = {};
  if (filters?.type && filters.type !== "all") {
    repoFilters.type = filters.type;
  }
  if (filters?.status && filters.status !== "all") {
    repoFilters.status = filters.status;
  }
  // TODO: Implementar filtros de data e partnerId no repositório e mapeá-los aqui.

  const transactions = await transactionRepo.findAll(repoFilters);

  // A filtragem agora é (parcialmente) feita no repositório.
  // Se houver filtros que o repositório ainda não suporta (ex: dateFrom, dateTo, partnerId),
  // eles ainda seriam aplicados aqui, mas o ideal é mover tudo para o repositório.

  let filteredTransactions = transactions;
  if (filters) {
    // Exemplo de como filtros adicionais (não no repo ainda) poderiam ser tratados:
    if (filters.partnerId) {
      filteredTransactions = filteredTransactions.filter(t => t.partnerId === filters.partnerId);
    }
    if (filters.dateFrom) {
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= new Date(filters.dateTo!));
    }
  }

  return filteredTransactions;
}
