"use server";

import { InsertPayment } from "@/db/repositories/schemas/paymentSchema";
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
    // revalidatePath("/transactions"); // Placeholder
    return { success: true, data: newPayment, message: "Pagamento adicionado com sucesso!" };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: error.flatten().fieldErrors, message: "Erro de validação." };
    }
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    console.error("addPaymentAction Error:", error);
    return { success: false, message: "Erro ao adicionar pagamento. Tente novamente." };
  }
}

import { SelectPayment } from "@/db/repositories/schemas/paymentSchema"; // Import SelectPayment

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
