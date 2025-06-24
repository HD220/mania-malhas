"use server";

import { InsertPayment } from "@/features/payment/schemas/paymentSchema";
import createPaymentUseCase from "@/usecases/payment/createPaymentUseCase";
import getPaymentsByTransactionIdUseCase from "@/usecases/payment/getPaymentsByTransactionIdUseCase";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

// Assuming a similar error response structure as product actions
export type PaymentServerResponse<T = null> = {
  success: boolean;
  data?: T;
  errors?: any; // Replace any with a more specific Zod error type if needed
  message?: string;
};

export async function addPaymentAction(
  data: InsertPayment
): Promise<PaymentServerResponse<{ id: string }>> {
  try {
    const newPayment = await createPaymentUseCase(data);
    // Revalidate the path where transaction details/payments are shown
    // This path might need to be dynamic, e.g., /transactions/[id]
    // For now, let's assume a generic revalidation or handle it on the client.
    revalidatePath("/transactions/list"); // Revalidar a lista de transações
    // Se existir uma página de detalhes da transação, considerar:
    // revalidatePath(`/admin/transactions/${data.transactionId}`); // Ajustar path conforme a rota real
    return { success: true, data: newPayment, message: "Pagamento adicionado com sucesso!" };
  } catch (error: unknown) { // Tipar error como unknown
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: error.flatten().formErrors.length > 0 ? error.flatten().formErrors.join(', ') : "Erro de validação nos dados do pagamento."
      };
    }

    let errorMessage = "Erro ao adicionar pagamento. Tente novamente.";
    if (error instanceof Error) {
      // Mensagens de erro do createPaymentUseCase (ex: "Transação não encontrada", valor excedido)
      // são consideradas seguras para exibição, pois são erros de domínio.
      errorMessage = error.message;
      console.error("addPaymentAction Server Action Error:", error.message, error.stack);
    } else {
      console.error("addPaymentAction Server Action Unexpected Error Type:", error);
    }
    return { success: false, message: errorMessage };
  }
}

import { SelectPayment } from "@/features/payment/schemas/paymentSchema"; // Import SelectPayment

export async function listPaymentsByTransactionAction(
  transactionId: string
): Promise<PaymentServerResponse<SelectPayment[]>> { // Use SelectPayment[]
  try {
    if (!transactionId) {
      return { success: false, message: "ID da Transação é obrigatório." };
    }
    const payments = await getPaymentsByTransactionIdUseCase(transactionId);
    return { success: true, data: payments };
  } catch (error) {
    console.error("listPaymentsByTransactionAction Error:", error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: "Erro ao buscar pagamentos." };
  }
}
