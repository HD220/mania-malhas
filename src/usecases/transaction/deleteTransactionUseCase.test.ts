import { describe, it, expect, vi } from "vitest";
import { ZodError } from "zod";
import { NotFoundError } from "@/lib/errors/domainErrors";
import deleteTransactionUseCase, {
  DeleteTransactionInput,
} from "./deleteTransactionUseCase"; // Adjust path as necessary
import { TransactionRepositoryFactory } from "@/db/repositories/transactionRepository";
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema";

// Mock the transaction repository
const mockTransactionRepository = {
  findById: vi.fn(),
  deleteById: vi.fn(),
  // Add other methods if your factory/interface expects them, even if not used in this specific use case
  findAll: vi.fn(),
  countAll: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
};

const mockTransactionRepoFactory: TransactionRepositoryFactory = () => mockTransactionRepository;

const validTransactionId = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
const sampleTransaction: SelectTransaction = {
  id: validTransactionId,
  description: "Test Transaction",
  value: 100,
  type: "E",
  status: "PENDING",
  partnerId: "p1",
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  paymentMethod: "card",
  installments: 1,
  dueDate: new Date(),
};

describe("deleteTransactionUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Clear mocks before each test
  });

  it("should successfully delete a transaction when a valid ID is provided and transaction exists", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    mockTransactionRepository.findById.mockResolvedValue(sampleTransaction);
    mockTransactionRepository.deleteById.mockResolvedValue(undefined); // deleteById usually doesn't return anything

    const result = await deleteTransactionUseCase(input, mockTransactionRepoFactory);

    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(mockTransactionRepository.deleteById).toHaveBeenCalledWith(validTransactionId);
    expect(result).toEqual({ success: true });
  });

  it("should throw NotFoundError if the transaction to be deleted does not exist", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    mockTransactionRepository.findById.mockResolvedValue(null); // Simulate transaction not found

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(NotFoundError);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(mockTransactionRepository.deleteById).not.toHaveBeenCalled();
  });

  it("should throw ZodError if the input ID is invalid (not a UUID)", async () => {
    const input: DeleteTransactionInput = { id: "not-a-uuid" };

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(ZodError);
    expect(mockTransactionRepository.findById).not.toHaveBeenCalled();
    expect(mockTransactionRepository.deleteById).not.toHaveBeenCalled();
  });

  it("should throw ZodError if the input ID is missing", async () => {
    // @ts-expect-error Testing invalid input
    const input: DeleteTransactionInput = {};

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(ZodError);
    expect(mockTransactionRepository.findById).not.toHaveBeenCalled();
    expect(mockTransactionRepository.deleteById).not.toHaveBeenCalled();
  });

  it("should propagate an error from transactionRepository.deleteById if it occurs", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    const deleteError = new Error("Database deletion failed");
    mockTransactionRepository.findById.mockResolvedValue(sampleTransaction);
    mockTransactionRepository.deleteById.mockRejectedValue(deleteError);

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(deleteError);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(mockTransactionRepository.deleteById).toHaveBeenCalledWith(validTransactionId);
  });

  it("should propagate an error from transactionRepository.findById if it occurs", async () => {
    const input: DeleteTransactionInput = { id: validTransactionId };
    const findError = new Error("Database find failed");
    mockTransactionRepository.findById.mockRejectedValue(findError);

    await expect(
      deleteTransactionUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(findError);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(mockTransactionRepository.deleteById).not.toHaveBeenCalled();
  });
});
