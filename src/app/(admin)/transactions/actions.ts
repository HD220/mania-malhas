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

/**
 * Defines the standardized server response structure for transaction-related actions.
 * @template T The type of data included in a successful response.
 * @property {boolean} success - Indicates if the action was successful.
 * @property {T} [data] - The data returned by the action on success. For list actions, this is `PaginatedTransactionsResult`.
 * @property {string} [message] - A general message, often used for errors or success confirmations.
 */
export type TransactionServerResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

/**
 * Server action to list transactions with optional filtering, pagination, and ordering.
 * Uses `unstable_noStore` to prevent caching of the response.
 * @async
 * @function listTransactionsAction
 * @param {GetTransactionsFilters} [filters] - Optional filters to apply to the transaction list.
 * @param {UseCasePaginationParams} [pagination] - Optional pagination parameters.
 * @param {UseCaseOrderByParams} [orderBy] - Optional ordering parameters.
 * @returns {Promise<TransactionServerResponse<PaginatedTransactionsResult>>} A paginated list of transactions or an error response.
 */
export async function listTransactionsAction(
  filters?: GetTransactionsFilters,
  pagination?: UseCasePaginationParams,
  orderBy?: UseCaseOrderByParams
): Promise<TransactionServerResponse<PaginatedTransactionsResult>> {
  noStore();

  try {
    const paginatedResult = await getTransactionsUseCase(filters, pagination, orderBy);
    return { success: true, data: paginatedResult };
  } catch (error: any) {
    console.error("listTransactionsAction Error:", error);
    return {
      success: false,
      message: error.message || "Erro ao buscar transações.",
      data: { data: [], totalItems: 0, totalPages: 0, currentPage: pagination?.page ?? 1, pageSize: pagination?.pageSize ?? 10 }
    };
  }
}

/**
 * Defines the server response structure for fetching a single transaction by its ID.
 * @property {boolean} success - Indicates if the action was successful.
 * @property {SelectTransaction} [data] - The transaction data if found.
 * @property {string} [message] - A message, typically for errors.
 */
export type GetTransactionByIdServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
};

/**
 * Server action to fetch a single transaction by its ID.
 * @async
 * @function getTransactionByIdAction
 * @param {string} id - The ID of the transaction to fetch.
 * @returns {Promise<GetTransactionByIdServerResponse>} The transaction data or an error response.
 */
export async function getTransactionByIdAction(id: string): Promise<GetTransactionByIdServerResponse> {
  try {
    const validatedInput = getTransactionByIdInputSchema.parse({ id });
    const transaction = await getTransactionByIdUseCase(validatedInput);
    return { success: true, data: transaction };
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "ID da transação inválido.",
      };
    }
    if (error instanceof NotFoundError) {
      return {
        success: false,
        message: error.message,
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

/**
 * Defines the server response structure for creating a new transaction.
 * @property {boolean} success - Indicates if the action was successful.
 * @property {SelectTransaction} [data] - The created transaction data on success.
 * @property {string} [message] - A general message, often for errors.
 * @property {Partial<Record<keyof CreateTransactionInput | "_form", string[]>>} [errors] - Validation errors, typically from Zod.
 */
export type CreateTransactionServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
  errors?: Partial<Record<keyof CreateTransactionInput | "_form", string[]>>;
};

/**
 * Server action to create a new transaction.
 * Revalidates the transaction list path upon successful creation.
 * @async
 * @function createTransactionAction
 * @param {CreateTransactionInput} data - The data for the new transaction.
 * @returns {Promise<CreateTransactionServerResponse>} The created transaction or an error response with validation errors.
 */
export async function createTransactionAction(
  data: CreateTransactionInput
): Promise<CreateTransactionServerResponse> {
  try {
    const newTransaction = await createTransactionUseCase(data);
    revalidatePath("/(admin)/transactions/list");
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
import { NotFoundError } from "@/lib/errors/domainErrors"; // Already imported above for getTransactionByIdAction

/**
 * Defines the server response structure for updating an existing transaction.
 * @property {boolean} success - Indicates if the action was successful.
 * @property {SelectTransaction} [data] - The updated transaction data on success.
 * @property {string} [message] - A general message, often for errors.
 * @property {Partial<Record<keyof UpdateTransactionInput | "_form", string[]>>} [errors] - Validation errors.
 */
export type UpdateTransactionServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
  errors?: Partial<Record<keyof UpdateTransactionInput | "_form", string[]>>;
};

/**
 * Server action to update an existing transaction.
 * Revalidates the transaction list path upon successful update.
 * @async
 * @function updateTransactionAction
 * @param {string} id - The ID of the transaction to update.
 * @param {UpdateTransactionInput} data - The new data for the transaction.
 * @returns {Promise<UpdateTransactionServerResponse>} The updated transaction or an error response.
 */
export async function updateTransactionAction(
  id: string,
  data: UpdateTransactionInput
): Promise<UpdateTransactionServerResponse> {
  try {
    const updatedTransaction = await updateTransactionUseCase(id, data);
    revalidatePath("/(admin)/transactions/list");
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
        message: error.message,
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
import getTransactionByIdUseCase, { getTransactionByIdInputSchema } from "@/usecases/transaction/getTransactionByIdUseCase"; // Already imported above
import { DomainConflictError } from "@/lib/errors/domainErrors"; // NotFoundError already imported

/**
 * Defines the server response structure for deleting a transaction.
 * @property {boolean} success - Indicates if the action was successful.
 * @property {string} [message] - A message confirming success or detailing an error.
 */
export type DeleteTransactionServerResponse = {
  success: boolean;
  message?: string;
};

/**
 * Server action to delete a transaction by its ID.
 * Revalidates the transaction list path upon successful deletion.
 * @async
 * @function deleteTransactionAction
 * @param {string} id - The ID of the transaction to delete.
 * @returns {Promise<DeleteTransactionServerResponse>} A success or error response.
 */
export async function deleteTransactionAction(id: string): Promise<DeleteTransactionServerResponse> {
  try {
    const validatedInput = deleteTransactionInputSchema.parse({ id });
    await deleteTransactionUseCase(validatedInput);

    revalidatePath("/(admin)/transactions/list");
    return { success: true, message: "Transação excluída com sucesso." };
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "ID da transação inválido."
      };
    }
    if (error instanceof NotFoundError) {
      return {
        success: false,
        message: error.message,
      };
    }
    if (error instanceof DomainConflictError) {
      return {
        success: false,
        message: error.message,
      };
    }
    console.error("deleteTransactionAction Error:", error);
    return {
      success: false,
      message: error.message || "Falha ao excluir transação.",
    };
  }
}
