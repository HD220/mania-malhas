import { db } from "@/db/postgres";
import { paymentRepository } from "@/db/repositories/paymentRepository";
import { InsertPayment, insertPaymentSchema } from "@/db/repositories/schemas/paymentSchema";
import { transactionTable } from "@/db/postgres/schema/transaction";
import { eq, sum, desc } from "drizzle-orm";
import { ZodError } from "zod";

export default async function createPaymentUseCase(
  input: InsertPayment
): Promise<{ id: string }> {
  // 1. Validate input data
  const parsedInput = insertPaymentSchema.parse(input); // Throws ZodError on failure

  // 2. Verify the transaction exists and is not fully paid (optional, but good practice)
  // This requires access to transaction data, could be done via transactionRepository if it existed
  // For now, let's assume the transaction ID is valid.
  // More complex validation: check if sum of existing payments for this transactionId + new payment value > transaction.value

  const { transactionId, value: paymentValue } = parsedInput;

  // Example of more complex validation (requires transactionRepository or direct db access here)
  // This is a simplified check. A real scenario might involve a transactionRepository.
  const [transactionDetails] = await db
    .select({
      totalValue: transactionTable.value,
      type: transactionTable.type,
    })
    .from(transactionTable)
    .where(eq(transactionTable.id, transactionId));

  if (!transactionDetails) {
    throw new Error("Transação não encontrada.");
  }

  // Optional: Check if payment would exceed transaction value for "Saída" (Expense)
  // Or if it's an "Entrada" (Income), this logic might differ or not be needed.
  // For now, this check is basic and might need refinement based on business rules.

  // Fetch existing payments for the transaction
  const existingPayments = await paymentRepository(db).findByTransactionId(transactionId);
  const totalPaid = existingPayments.reduce((acc, p) => acc + Number(p.value), 0);

  if (Number(totalPaid) + Number(paymentValue) > Number(transactionDetails.totalValue) + 0.001) { // Add small tolerance for float issues
     throw new Error(`O valor do pagamento (R$ ${paymentValue.toFixed(2)}) excede o saldo devedor da transação (R$ ${(Number(transactionDetails.totalValue) - totalPaid).toFixed(2)}).`);
  }


  // 3. Insert the payment
  const repo = paymentRepository(db); // Using the main db instance for now
  const result = await repo.insert(parsedInput);

  // 4. Optional: Update transaction status if fully paid (e.g., add a 'status' field to transactionTable)
  // This would typically happen within a transaction that includes inserting the payment.
  // For now, this step is omitted.

  return result;
}
