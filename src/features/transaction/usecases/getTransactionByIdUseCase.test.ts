import { describe, it, expect, vi, beforeEach } from "vitest";
import getTransactionByIdUseCase, { getTransactionByIdInputSchema } from "./getTransactionByIdUseCase";
import { TransactionRepositoryFactory } from "@/features/transaction/db/transactionRepository";
import { SelectTransaction } from "@/features/transaction/schemas/transactionSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";
import { ZodError } from "zod";
import { faker } from "@faker-js/faker";

const mockTransactionRepository = {
  findById: vi.fn(),
  findAll: vi.fn(),
  countAll: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  deleteById: vi.fn(),
};

const mockTransactionRepoFactory: TransactionRepositoryFactory = () => mockTransactionRepository;

const validTransactionId = faker.string.uuid();
const sampleTransaction: SelectTransaction = {
  id: validTransactionId,
  description: "Test Transaction",
  value: 100.50, // Schema coerces to number
  type: "E",
  status: "Pendente",
  partnerId: faker.string.uuid(),
  date: new Date(),
  due_date: new Date(), // Corrected to due_date
  createdAt: new Date(),
  updatedAt: new Date(),
  transactionId: null,
};

describe("getTransactionByIdUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return a transaction when a valid ID is provided and transaction exists", async () => {
    mockTransactionRepository.findById.mockResolvedValue(sampleTransaction);
    const input = { id: validTransactionId };

    const result = await getTransactionByIdUseCase(input, mockTransactionRepoFactory);

    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
    expect(result).toEqual(sampleTransaction);
  });

  it("should throw NotFoundError if the transaction does not exist", async () => {
    mockTransactionRepository.findById.mockResolvedValue(null);
    const input = { id: validTransactionId };

    await expect(
      getTransactionByIdUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(NotFoundError);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
  });

  it("should throw ZodError if the input ID is invalid", async () => {
    const input = { id: "not-a-uuid" };

    await expect(
      getTransactionByIdUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(ZodError);
    expect(mockTransactionRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw ZodError if the input ID is missing", async () => {
    const input = {} as GetTransactionByIdInput; // Cast for test
    await expect(
        getTransactionByIdUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(ZodError);
    expect(mockTransactionRepository.findById).not.toHaveBeenCalled();
  });

  it("should propagate an error from transactionRepository.findById if it occurs", async () => {
    const dbError = new Error("Database connection error");
    mockTransactionRepository.findById.mockRejectedValue(dbError);
    const input = { id: validTransactionId };

    await expect(
      getTransactionByIdUseCase(input, mockTransactionRepoFactory)
    ).rejects.toThrow(dbError);
    expect(mockTransactionRepository.findById).toHaveBeenCalledWith(validTransactionId);
  });
});
