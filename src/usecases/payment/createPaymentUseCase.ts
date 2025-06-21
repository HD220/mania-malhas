import { db } from "@/db/postgres";
import { paymentRepository } from "@/db/repositories/paymentRepository";
import { InsertPayment, insertPaymentSchema } from "@/db/repositories/schemas/paymentSchema";
import { transactionTable } from "@/db/postgres/schema/transaction";
import { eq, sum, desc } from "drizzle-orm";
import { ZodError } from "zod";

/**
 * Creates a new payment for a given transaction.
 *
 * This use case performs several steps:
 * 1. Validates the input payment data using `insertPaymentSchema`.
 * 2. Retrieves details of the associated transaction (e.g., total value).
 * 3. Validates if the transaction exists.
 * 4. Calculates the sum of existing payments for the transaction.
 * 5. Validates if the new payment amount would exceed the transaction's total value (with a small tolerance for floating point issues).
 * 6. Inserts the new payment using the payment repository.
 *
 * Note: This use case currently performs direct database queries for transaction details and existing payments.
 * In a more layered architecture, this logic might be encapsulated within a `transactionRepository` or other use cases.
 * Updating the transaction status (e.g., to "Pago") after a payment is made is mentioned as an optional future step.
 *
 * @param {InsertPayment} input - The payment data to be created.
 *   - `transactionId`: ID of the transaction this payment belongs to.
 *   - `value`: Amount of the payment.
 *   - `date` (optional): Date of the payment (defaults to current date if not provided by schema/db).
 * @returns {Promise<{ id: string }>} A promise that resolves to an object containing the ID of the newly created payment.
 * @throws {ZodError} If the input payment data fails validation.
 * @throws {Error} If the associated transaction is not found.
 * @throws {Error} If the payment value exceeds the remaining balance of the transaction.
 * @throws {Error} If there's an issue with the repository during data persistence.
 */
export default async function createPaymentUseCase(
  input: InsertPayment
): Promise<{ id: string }> {
  // 1. Validate input payment data
  const parsedInput = insertPaymentSchema.parse(input);

  const { transactionId, value: paymentValue } = parsedInput;

  // 2. Retrieve transaction details
  // This is a direct DB access. Ideally, this could go through a transactionRepository.
  const [transactionDetails] = await db
    .select({
      totalValue: transactionTable.value,
      type: transactionTable.type, // Type might be used for different payment rules in future
    })
    .from(transactionTable)
    .where(eq(transactionTable.id, transactionId));

  if (!transactionDetails) {
    throw new Error("Transação não encontrada.");
  }

  // 3. Calculate sum of existing payments and validate new payment
  const paymentRepo = paymentRepository(db);
  const existingPayments = await paymentRepo.findByTransactionId(transactionId);
  const totalPaidSoFar = existingPayments.reduce((acc, p) => acc + Number(p.value), 0);

  // Check if the new payment exceeds the transaction's total value.
  // A small tolerance (0.001) is added to handle potential floating-point inaccuracies.
  if (Number(totalPaidSoFar) + Number(paymentValue) > Number(transactionDetails.totalValue) + 0.001) {
     throw new Error(
       `O valor do pagamento (R$ ${Number(paymentValue).toFixed(2)}) excede o saldo devedor da transação (R$ ${(Number(transactionDetails.totalValue) - totalPaidSoFar).toFixed(2)}).`
     );
  }

  // 4. Insert the new payment
  const result = await paymentRepo.insert(parsedInput);

  // 5. Optional future step: Update transaction status
  // e.g., if (Number(totalPaidSoFar) + Number(paymentValue) >= Number(transactionDetails.totalValue)) { /* update transaction status to 'Pago' */ }
  // This should ideally be part of a database transaction with the payment insertion.

  return result;
}
