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

import createTransactionUseCase, { CreateTransactionInput } from "@/usecases/transaction/createTransactionUseCase";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";

// Tipo específico para a resposta da action de criação
export type CreateTransactionServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
  errors?: Partial<Record<keyof CreateTransactionInput | "_form", string[]>>; // Para erros de formulário Zod
};

export async function createTransactionAction(
  data: CreateTransactionInput
): Promise<CreateTransactionServerResponse> {
  try {
    const newTransaction = await createTransactionUseCase(data);
    revalidatePath("/(admin)/transactions/list"); // Revalidar a lista de transações
    // Considerar revalidar outras páginas, como o dashboard, se ele mostrar totais/contagens
    // revalidatePath("/(admin)/dashboard");
    return { success: true, data: newTransaction };
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Erro de validação.",
        errors: error.flatten().fieldErrors as Partial<Record<keyof CreateTransactionInput, string[]>>,
      };
    }
    console.error("createTransactionAction Error:", error);
    return {
      success: false,
      message: error.message || "Falha ao criar transação.",
    };
  }
}

import updateTransactionUseCase, { UpdateTransactionInput } from "@/usecases/transaction/updateTransactionUseCase";
import { NotFoundError } from "@/lib/errors/domainErrors";

// Tipo específico para a resposta da action de atualização
export type UpdateTransactionServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
  errors?: Partial<Record<keyof UpdateTransactionInput | "_form", string[]>>;
};

export async function updateTransactionAction(
  id: string,
  data: UpdateTransactionInput
): Promise<UpdateTransactionServerResponse> {
  try {
    const updatedTransaction = await updateTransactionUseCase(id, data);
    revalidatePath("/(admin)/transactions/list");
    // Se houver uma página de detalhes/edição específica, revalidá-la também:
    // revalidatePath(`/(admin)/transactions/${id}`);
    // revalidatePath(`/(admin)/transactions/${id}/edit`);
    return { success: true, data: updatedTransaction };
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Erro de validação.",
        errors: error.flatten().fieldErrors as Partial<Record<keyof UpdateTransactionInput, string[]>>,
      };
    }
    if (error instanceof NotFoundError) {
      return {
        success: false,
        message: error.message, // "Transação não encontrada."
      };
    }
    console.error("updateTransactionAction Error:", error);
    return {
      success: false,
      message: error.message || "Falha ao atualizar transação.",
    };
  }
}

// Poderíamos adicionar actions para criar/atualizar/deletar transações aqui também, se necessário.
// Ex: createTransactionAction, updateTransactionStatusAction, etc.
