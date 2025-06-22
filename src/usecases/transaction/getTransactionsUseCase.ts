import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository, TransactionWithPartner } from "@/db/repositories/transactionRepository"; // Import TransactionWithPartner
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema"; // SelectTransaction ainda pode ser útil para outros contextos

// Tipos para filtros (podem ser expandidos)
export interface GetTransactionsFilters {
  status?: string;
  type?: "E" | "S";
  partnerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Interface para os parâmetros de paginação do caso de uso
export interface UseCasePaginationParams {
  page?: number;
  pageSize?: number;
}

// Interface para o resultado paginado
export interface PaginatedTransactionsResult {
  data: TransactionWithPartner[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Fetches a paginated list of transactions, optionally applying filters.
 * Includes partner names in the transaction data.
 *
 * This use case handles:
 * - Mapping UI filters to repository filters.
 * - Calling the repository to get a paginated list of transactions and the total count of items.
 * - Applying any filters not yet supported by the repository at the application level (with a TODO to move them).
 * - Calculating pagination metadata (totalPages, currentPage, etc.).
 *
 * @param {GetTransactionsFilters} [filters] - Filters to apply (e.g., type, status, partnerId, date range).
 * @param {UseCasePaginationParams} [pagination] - Pagination parameters (page, pageSize).
 * @returns {Promise<PaginatedTransactionsResult>} An object containing the paginated transaction data and pagination info.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function getTransactionsUseCase(
  filters?: GetTransactionsFilters,
  pagination?: UseCasePaginationParams
): Promise<PaginatedTransactionsResult> {
  const transactionRepo = createTransactionRepository(db);
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10; // Default pageSize
  const offset = (page - 1) * pageSize;

  // Mapear filtros da UI para filtros do repositório.
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

  // Aplicar filtros que o repositório ainda não suporta (se houver)
  // Esta lógica de filtro no lado da aplicação deve ser minimizada ou eliminada
  // movendo toda a filtragem para o repositório.
  const applyApplicationLevelFilters = (data: TransactionWithPartner[], appFilters?: GetTransactionsFilters) => {
    if (!appFilters) return data;
    return data.filter(t => {
      let matches = true;
      if (appFilters.partnerId && t.partnerId !== appFilters.partnerId) matches = false;
      if (appFilters.dateFrom && new Date(t.date) < new Date(appFilters.dateFrom)) matches = false;
      if (appFilters.dateTo && new Date(t.date) > new Date(appFilters.dateTo)) matches = false;
      return matches;
    });
  };

  // 1. Obter a contagem total de itens com os filtros aplicados (os que o repo suporta)
  // Para uma contagem precisa que reflita os filtros do lado da aplicação,
  // a filtragem do lado da aplicação teria que ser feita antes da contagem, o que é ineficiente.
  // Idealmente, TODOS os filtros são passados para countAll e findAll.
  // Por agora, countAll reflete apenas os filtros que o repo suporta.
  const totalItems = await transactionRepo.countAll(repoFilters);

  // 2. Obter os dados paginados com os filtros que o repo suporta
  const paginatedDataFromRepo = await transactionRepo.findAll(repoFilters, { offset, limit: pageSize });

  // 3. Aplicar filtros restantes no lado da aplicação (se houver)
  // Nota: Isso afeta apenas os dados da página atual, não a contagem total de forma precisa
  // se os filtros de aplicação fossem muito restritivos.
  const finalData = applyApplicationLevelFilters(paginatedDataFromRepo, filters);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data: finalData,
    totalItems,
    totalPages,
    currentPage: page,
    pageSize,
  };
}
