import { db } from "@/db/postgres";
import { paymentRepository } from "@/db/repositories/paymentRepository";
import { SelectPayment } from "@/db/repositories/schemas/paymentSchema";

export default async function getPaymentsByTransactionIdUseCase(
  transactionId: string
): Promise<SelectPayment[]> {
  if (!transactionId) {
    // Or throw an error, depending on how you want to handle invalid input
    return [];
  }
  const repo = paymentRepository(db);
  return await repo.findByTransactionId(transactionId);
}
