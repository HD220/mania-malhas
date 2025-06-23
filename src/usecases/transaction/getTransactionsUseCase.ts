import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository, TransactionWithPartner } from "@/db/repositories/transactionRepository"; // Import TransactionWithPartner
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema"; // SelectTransaction ainda pode ser útil para outros contextos

/**
 * Defines the available filters for fetching transactions.
 * All properties are optional.
 */
export interface GetTransactionsFilters {
  /** Filter by transaction status (e.g., "Pendente", "Pago"). */
  status?: string;
  /** Filter by transaction type ('E' for Entrada/Income, 'S' for Saída/Expense). */
  type?: "E" | "S";
  /** Filter by the ID of the associated partner. */
  partnerId?: string;
  /** Filter transactions from this date onwards. */
  dateFrom?: Date;
  /** Filter transactions up to this date. */
  dateTo?: Date;
  /** Filter by a search term in the transaction description. */
  description?: string;
}

/**
 * Defines pagination parameters for use cases.
 */
export interface UseCasePaginationParams {
  /** The page number to retrieve (1-indexed). */
  page?: number;
  /** The number of items to retrieve per page. */
  pageSize?: number;
}

// Importar OrderByParams do repositório ou redefinir/adaptar aqui
import { OrderByParams as RepoOrderByParams, TransactionSortBy } from "@/db/repositories/transactionRepository";

/**
 * Defines ordering parameters for fetching transactions in use cases.
 */
export interface UseCaseOrderByParams {
  /** The column to sort by (e.g., "date", "value"). */
  column?: TransactionSortBy;
  /** The direction of sorting ("asc" for ascending, "desc" for descending). */
  direction?: "asc" | "desc";
}

/**
 * Defines the structure of the paginated result for transactions.
 * Includes the transaction data along with pagination metadata.
 */
export interface PaginatedTransactionsResult {
  /** An array of transactions for the current page, including partner names. */
  data: TransactionWithPartner[];
  /** The total number of items matching the filters. */
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
  pagination?: UseCasePaginationParams,
  orderBy?: UseCaseOrderByParams // Adicionar orderBy
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
  if (filters?.dateFrom) {
    repoFilters.dateFrom = filters.dateFrom;
  }
  if (filters?.dateTo) {
    repoFilters.dateTo = filters.dateTo;
  }
  if (filters?.partnerId) {
    repoFilters.partnerId = filters.partnerId;
  }
  if (filters?.description && filters.description.trim() !== "") { // Passar descrição para repoFilters
    repoFilters.description = filters.description.trim();
  }

  // Aplicar filtros que o repositório ainda não suporta (se houver)
  // Esta lógica de filtro no lado da aplicação deve ser minimizada ou eliminada
  // movendo toda a filtragem para o repositório.
  const applyApplicationLevelFilters = (data: TransactionWithPartner[], appFilters?: GetTransactionsFilters) => {
    if (!appFilters) return data;
    return data.filter(t => {
      let matches = true;
      // partnerId agora é tratado pelo repositório
      // if (appFilters.partnerId && t.partnerId !== appFilters.partnerId) matches = false;

      // dateFrom e dateTo também são tratados pelo repositório
      // if (appFilters.dateFrom && new Date(t.date) < new Date(appFilters.dateFrom)) matches = false;
      // if (appFilters.dateTo && new Date(t.date) > new Date(appFilters.dateTo)) matches = false;

      // Se não houver mais filtros a nível de aplicação, esta função pode retornar 'data' diretamente.
      // Por enquanto, manter a estrutura caso outros filtros app-level sejam necessários no futuro.
      return matches;
    });
  };

  // 1. Obter a contagem total de itens com os filtros aplicados (os que o repo suporta)
  // Para uma contagem precisa que reflita os filtros do lado da aplicação,
  // a filtragem do lado da aplicação teria que ser feita antes da contagem, o que é ineficiente.
  // Idealmente, TODOS os filtros são passados para countAll e findAll.
  // Por agora, countAll reflete apenas os filtros que o repo suporta.
  const totalItems = await transactionRepo.countAll(repoFilters);

  // 2. Obter os dados paginados com os filtros e ordenação que o repo suporta
  // Mapear UseCaseOrderByParams para RepoOrderByParams (são idênticos neste caso)
  const repoOrderBy: RepoOrderByParams | undefined = orderBy;
  const paginatedDataFromRepo = await transactionRepo.findAll(repoFilters, { offset, limit: pageSize }, repoOrderBy);

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
