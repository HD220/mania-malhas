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

// Server response type for fetching a single transaction
export type GetTransactionByIdServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
  // No fieldErrors expected here as it's a GET by ID
};

export async function getTransactionByIdAction(id: string): Promise<GetTransactionByIdServerResponse> {
  try {
    const validatedInput = getTransactionByIdInputSchema.parse({ id });
    const transaction = await getTransactionByIdUseCase(validatedInput);
    return { success: true, data: transaction };
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "ID da transação inválido.", // Or specific field error if schema was more complex
      };
    }
    if (error instanceof NotFoundError) {
      return {
        success: false,
        message: error.message, // "Transação com ID X não encontrada."
      };
    }
    console.error("getTransactionByIdAction Error:", error);
    return {
      success: false,
      message: error.message || "Falha ao buscar transação.",
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

import deleteTransactionUseCase, { deleteTransactionInputSchema } from "@/usecases/transaction/deleteTransactionUseCase";
// Import getTransactionByIdUseCase and its input schema
import getTransactionByIdUseCase, { getTransactionByIdInputSchema } from "@/usecases/transaction/getTransactionByIdUseCase";
import { DomainConflictError, NotFoundError } from "@/lib/errors/domainErrors";
import { ZodError } from "zod";
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema";

// Tipo específico para a resposta da action de exclusão
export type DeleteTransactionServerResponse = {
  success: boolean;
  message?: string;
};

export async function deleteTransactionAction(id: string): Promise<DeleteTransactionServerResponse> {
  try {
    // Validate the ID using the use case's schema before calling the use case
    const validatedInput = deleteTransactionInputSchema.parse({ id });
    await deleteTransactionUseCase(validatedInput);

    revalidatePath("/(admin)/transactions/list");
    // Considerar revalidar outras páginas que possam ser afetadas (ex: dashboard)
    // revalidatePath("/(admin)/dashboard");
    return { success: true, message: "Transação excluída com sucesso." };
  } catch (error: any) {
    if (error instanceof ZodError) {
      // Although we parse 'id' which is simple, if the schema were complex,
      // this would map field errors. For a simple ID, a general message is fine.
      return {
        success: false,
        message: "ID da transação inválido." // Or error.flatten().fieldErrors.id?.join(", ")
      };
    }
    if (error instanceof NotFoundError) {
      return {
        success: false,
        message: error.message, // "Transaction with ID X not found."
      };
    }
    if (error instanceof DomainConflictError) {
      return {
        success: false,
        message: error.message, // "Transaction with ID X cannot be deleted because..."
      };
    }
    console.error("deleteTransactionAction Error:", error);
    return {
      success: false,
      message: error.message || "Falha ao excluir transação.",
    };
  }
}
