"use server";

// SelectTransaction não é mais o tipo primário aqui, mas TransactionWithPartner é.
// Manter SelectTransaction se for usado em outros lugares ou para tipos base.
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema";
import getTransactionsUseCase, {
  GetTransactionsFilters,
  UseCasePaginationParams,
  PaginatedTransactionsResult,
  UseCaseOrderByParams // Importar tipo de ordenação do caso de uso
} from "@/usecases/transaction/getTransactionsUseCase";
import { unstable_noStore as noStore } from "next/cache";
import { TransactionWithPartner } from "@/db/repositories/transactionRepository";

// Definindo um tipo de resposta para consistência, similar a outras actions
// Agora, o 'data' será o PaginatedTransactionsResult
export type TransactionServerResponse<T> = {
  success: boolean;
  data?: T; // T será PaginatedTransactionsResult
  message?: string;
};

export async function listTransactionsAction(
  filters?: GetTransactionsFilters,
  pagination?: UseCasePaginationParams,
  orderBy?: UseCaseOrderByParams // Adicionar parâmetros de ordenação
): Promise<TransactionServerResponse<PaginatedTransactionsResult>> {
  noStore();

  try {
    // Passar filtros, paginação e ordenação para o caso de uso
    const paginatedResult = await getTransactionsUseCase(filters, pagination, orderBy);
    return { success: true, data: paginatedResult };
  } catch (error: any) {
    console.error("listTransactionsAction Error:", error);
    return {
      success: false,
      message: error.message || "Erro ao buscar transações.",
      // Retornar uma estrutura de dados padrão em caso de erro para evitar quebras na UI
      data: { data: [], totalItems: 0, totalPages: 0, currentPage: pagination?.page ?? 1, pageSize: pagination?.pageSize ?? 10 }
    };
  }
}

// Poderíamos adicionar actions para criar/atualizar/deletar transações aqui também, se necessário.
// Ex: createTransactionAction, updateTransactionStatusAction, etc.
