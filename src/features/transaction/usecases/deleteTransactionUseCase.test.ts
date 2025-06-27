import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZodError } from "zod";

import { PaymentRepositoryFactory } from "@/features/payment/db/payment-repository";
import { SelectPayment } from "@/features/payment/schemas/payment.schema";
import { TransactionRepositoryFactory } from "@/features/transaction/db/transactionRepository";
import { SelectTransaction } from "@/features/transaction/schemas/transactionSchema";
import { NotFoundError, DomainConflictError } from "@/lib/errors/domainErrors";

import deleteTransactionUseCase, {
  DeleteTransactionInput,
} from "./deleteTransactionUseCase"; // Corrected relative import

// Mock the transaction repository
const mockTransactionRepository = {
  findById: vi.fn(),
  deleteById: vi.fn(),
  findAll: vi.fn(),
  countAll: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
};
const mockTransactionRepoFactory: TransactionRepositoryFactory = () => mockTransactionRepository;

// Mock the payment repository
const mockPaymentRepository = {
  findByTransactionId: vi.fn(),
  insert: vi.fn(),
};
const mockPaymentRepoFactory: PaymentRepositoryFactory = () => mockPaymentRepository;

const validTransactionId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
const sampleTransaction: SelectTransaction = {
  id: validTransactionId,
  description: "Test Transaction",
  value: 100, // Assuming number for SelectTransaction, schema coerces
  type: "E",
  status: "Pendente", // Corrected status to match SelectTransaction potential values
  partnerId: "p1",
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  // Fields like paymentMethod and installments might not be in SelectTransaction
  // if they are not part of transactionTable directly.
  // For this test, if they are not strictly needed for delete logic, can be omitted
  // or ensure SelectTransaction includes them if it should.
  // Based on transactionSchema.ts, these are not there.
  // paymentMethod: "card",
  // installments: 1,
  due_date: new Date(), // Corrected from dueDate to due_date to match schema
  transactionId: null, // Added to match SelectTransaction
};

describe("deleteTransactionUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should successfully delete a transaction if it exists and has no associated payments", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    mockTransactionRepository.findById.mockResolvedValue(sampleTransaction);
    mockPaymentRepository.findByTransactionId.mockResolvedValue([]);
    mockTransactionRepository.deleteById.mockResolvedValue(undefined);

    const result = await deleteTransactionUseCase(
      input,
      mockTransactionRepoFactory,
      mockPaymentRepoFactory
    );

    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(mockPaymentRepository.findByTransactionId).toHaveBeenCalledWith(validTransactionId);
    expect(mockTransactionRepository.deleteById).toHaveBeenCalledWith(validTransactionId);
    expect(result).toEqual({ success: true });
  });

  it("should throw DomainConflictError if the transaction has associated payments", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    const samplePayment: SelectPayment = { // Ensure SelectPayment matches its schema
      id: "payment1",
      transactionId: validTransactionId,
      value: 50, // Assuming number for SelectPayment
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTransactionRepository.findById.mockResolvedValue(sampleTransaction);
    mockPaymentRepository.findByTransactionId.mockResolvedValue([samplePayment]);

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory, mockPaymentRepoFactory)
    ).rejects.toThrow(DomainConflictError);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(mockPaymentRepository.findByTransactionId).toHaveBeenCalledWith(validTransactionId);
    expect(mockTransactionRepository.deleteById).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if the transaction to be deleted does not exist", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    mockTransactionRepository.findById.mockResolvedValue(null);

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory, mockPaymentRepoFactory)
    ).rejects.toThrow(NotFoundError);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(mockPaymentRepository.findByTransactionId).not.toHaveBeenCalled();
    expect(mockTransactionRepository.deleteById).not.toHaveBeenCalled();
  });

  it("should throw ZodError if the input ID is invalid (not a UUID)", async () => {
    const input: DeleteTransactionInput = { id: "not-a-uuid" };

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory, mockPaymentRepoFactory)
    ).rejects.toThrow(ZodError);
    expect(mockTransactionRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw ZodError if the input ID is missing", async () => {
    const input: DeleteTransactionInput = {} as DeleteTransactionInput; // Cast for test

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory, mockPaymentRepoFactory)
    ).rejects.toThrow(ZodError);
  });

  it("should propagate an error from transactionRepository.deleteById if it occurs (and no payments)", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    const deleteError = new Error("Database deletion failed");
    mockTransactionRepository.findById.mockResolvedValue(sampleTransaction);
    mockPaymentRepository.findByTransactionId.mockResolvedValue([]);
    mockTransactionRepository.deleteById.mockRejectedValue(deleteError);

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory, mockPaymentRepoFactory)
    ).rejects.toThrow(deleteError);
  });

  it("should propagate an error from paymentRepository.findByTransactionId if it occurs", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    const paymentError = new Error("Payment lookup failed");
    mockTransactionRepository.findById.mockResolvedValue(sampleTransaction);
    mockPaymentRepository.findByTransactionId.mockRejectedValue(paymentError);

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory, mockPaymentRepoFactory)
    ).rejects.toThrow(paymentError);
  });

  it("should propagate an error from transactionRepository.findById if it occurs", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    const findError = new Error("Database find failed");
    mockTransactionRepository.findById.mockRejectedValue(findError);

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory, mockPaymentRepoFactory)
    ).rejects.toThrow(findError);
  });
});
