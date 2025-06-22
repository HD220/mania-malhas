import { describe, it, expect, vi, beforeEach } from 'vitest';
import updateTransactionUseCase, { UpdateTransactionInput, updateTransactionSchema } from './updateTransactionUseCase';
import { transactionRepository } from '@/db/repositories/transactionRepository';
import { SelectTransaction } from '@/db/repositories/schemas/transactionSchema';
import { ZodError } from 'zod';
import { NotFoundError } from '@/lib/errors/domainErrors';
import { faker } from '@faker-js/faker';

// Mock do transactionRepository factory
vi.mock('@/db/repositories/transactionRepository', () => ({
  transactionRepository: vi.fn().mockReturnValue({
    findById: vi.fn(),
    update: vi.fn(), // Will be used in UC-TX-UPDATE.2
    // Add other methods if needed for type completion
    insert: vi.fn(),
    findAll: vi.fn(),
    countAll: vi.fn(),
    deleteById: vi.fn(),
  }),
}));

describe('updateTransactionUseCase (Phase 1: Find and Validate)', () => {
  let mockRepo: ReturnType<ReturnType<typeof transactionRepository>>;
  const transactionId = faker.string.uuid();

  const mockExistingTransaction: SelectTransaction = {
    id: transactionId,
    description: 'Transação Original',
    value: "100.00",
    type: 'E',
    status: 'Pendente',
    partnerId: faker.string.uuid(),
    date: new Date('2024-01-15T00:00:00.000Z'),
    due_date: new Date('2024-01-20T00:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Correctly get the mocked repository instance
    // The mock for transactionRepository returns an object with mocked methods (findById, update etc.)
    // So, we re-assign it to mockRepo to ensure it's fresh for each test.
    mockRepo = transactionRepository(vi.fn() as any) as ReturnType<ReturnType<typeof transactionRepository>>;
  });

  const validUpdateData: UpdateTransactionInput = {
    description: 'Transação Atualizada',
    status: 'Pago',
  };

  it('should find existing transaction, validate data, and return existing transaction (Phase 1)', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);

    const result = await updateTransactionUseCase(transactionId, validUpdateData);

    expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockRepo.findById).toHaveBeenCalledWith(transactionId);
    // Zod parse is called internally, if it passes, no error is thrown.
    // The actual update call is not made in this phase.
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(result).toEqual(mockExistingTransaction); // Returns existing for now
  });

  it('should throw NotFoundError if transaction is not found', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(null);

    await expect(updateTransactionUseCase(transactionId, validUpdateData))
      .rejects.toThrow(NotFoundError);
    await expect(updateTransactionUseCase(transactionId, validUpdateData))
      .rejects.toThrow("Transação não encontrada.");

    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should throw ZodError if update data is invalid', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const invalidUpdateData = { ...validUpdateData, value: "not-a-valid-number" } as any;

    await expect(updateTransactionUseCase(transactionId, invalidUpdateData))
      .rejects.toThrow(ZodError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should allow partial updates (e.g., only description)', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const partialUpdate: UpdateTransactionInput = { description: 'Só descrição atualizada' };

    const result = await updateTransactionUseCase(transactionId, partialUpdate);

    expect(mockRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockRepo.update).not.toHaveBeenCalled(); // Not called in Phase 1
    expect(result).toEqual(mockExistingTransaction);
  });

   it('should allow updating type and status', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const partialUpdate: UpdateTransactionInput = { type: 'S', status: 'Cancelado' };

    const result = await updateTransactionUseCase(transactionId, partialUpdate);

    expect(mockRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(result).toEqual(mockExistingTransaction);
  });


  it('should throw ZodError for invalid type', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const invalidData = { type: 'X' } as any; // Invalid type

    await expect(updateTransactionUseCase(transactionId, invalidData))
      .rejects.toThrow(ZodError);
  });

  it('should throw ZodError for invalid status', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const invalidData = { status: 'Muito Atrasado' } as any; // Invalid status

    await expect(updateTransactionUseCase(transactionId, invalidData))
      .rejects.toThrow(ZodError);
  });
});
