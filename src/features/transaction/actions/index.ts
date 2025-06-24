"use server";

import { SelectTransaction } from "@/features/transaction/schemas/transactionSchema";
import getTransactionsUseCase, {
  GetTransactionsFilters,
  UseCasePaginationParams,
  PaginatedTransactionsResult,
  UseCaseOrderByParams
} from "@/features/transaction/usecases/getTransactionsUseCase";
import { unstable_noStore as noStore } from "next/cache";
import { TransactionWithPartner } from "@/features/transaction/db/transactionRepository";
import createTransactionUseCase, { CreateTransactionInput } from "@/features/transaction/usecases/createTransactionUseCase";
import updateTransactionUseCase, { UpdateTransactionInput } from "@/features/transaction/usecases/updateTransactionUseCase";
import deleteTransactionUseCase, { deleteTransactionInputSchema } from "@/features/transaction/usecases/deleteTransactionUseCase";
import getTransactionByIdUseCase, { getTransactionByIdInputSchema } from "@/features/transaction/usecases/getTransactionByIdUseCase";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { NotFoundError, DomainConflictError } from "@/lib/errors/domainErrors";

export type TransactionServerResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

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

export type GetTransactionByIdServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
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

export type CreateTransactionServerResponse = {
  success: boolean;
  data?: SelectTransaction;
  message?: string;
  errors?: Partial<Record<keyof CreateTransactionInput | "_form", string[]>>;
};

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

export type DeleteTransactionServerResponse = {
  success: boolean;
  message?: string;
};

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
