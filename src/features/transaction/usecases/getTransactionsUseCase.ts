import { db } from "@/db/postgres";
import { transactionRepository as createTransactionRepository, TransactionWithPartner } from "@/features/transaction/db/transactionRepository";
import { SelectTransaction } from "@/features/transaction/schemas/transactionSchema";

export interface GetTransactionsFilters {
  status?: string;
  type?: "E" | "S";
  partnerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  description?: string;
}

export interface UseCasePaginationParams {
  page?: number;
  pageSize?: number;
}

import { OrderByParams as RepoOrderByParams, TransactionSortBy } from "@/features/transaction/db/transactionRepository";

export interface UseCaseOrderByParams {
  column?: TransactionSortBy;
  direction?: "asc" | "desc";
}

export interface PaginatedTransactionsResult {
  data: TransactionWithPartner[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default async function getTransactionsUseCase(
  filters?: GetTransactionsFilters,
  pagination?: UseCasePaginationParams,
  orderBy?: UseCaseOrderByParams
): Promise<PaginatedTransactionsResult> {
  const transactionRepo = createTransactionRepository(db);
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const offset = (page - 1) * pageSize;

  const repoFilters: import("@/features/transaction/db/transactionRepository").TransactionFiltersForRepo = {};
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
  if (filters?.description && filters.description.trim() !== "") {
    repoFilters.description = filters.description.trim();
  }

  const applyApplicationLevelFilters = (data: TransactionWithPartner[], appFilters?: GetTransactionsFilters) => {
    if (!appFilters) return data;
    return data.filter(t => {
      let matches = true;
      return matches;
    });
  };

  const totalItems = await transactionRepo.countAll(repoFilters);
  const repoOrderBy: RepoOrderByParams | undefined = orderBy;
  const paginatedDataFromRepo = await transactionRepo.findAll(repoFilters, { offset, limit: pageSize }, repoOrderBy);
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
