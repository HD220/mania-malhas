import { describe, it, expect, vi, beforeEach } from 'vitest';
import updateTransactionUseCase, { UpdateTransactionInput, updateTransactionSchema } from './updateTransactionUseCase';
import { transactionRepository } from '@/features/transaction/db/transactionRepository';
import { SelectTransaction } from '@/features/transaction/schemas/transactionSchema';
import { ZodError } from 'zod';
import { NotFoundError } from '@/lib/errors/domainErrors';
import { faker } from '@faker-js/faker';

// Mock do transactionRepository factory
vi.mock('@/features/transaction/db/transactionRepository', () => ({
  transactionRepository: vi.fn().mockReturnValue({
    findById: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    findAll: vi.fn(),
    countAll: vi.fn(),
    deleteById: vi.fn(),
  }),
}));

describe('updateTransactionUseCase', () => {
  let mockRepo: ReturnType<ReturnType<typeof transactionRepository>>;
  const transactionId = faker.string.uuid();

  const mockExistingTransaction: SelectTransaction = {
    id: transactionId,
    description: 'Transação Original',
    value: 100.00, // Schema coerces this
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
    mockRepo = transactionRepository(vi.fn() as any) as ReturnType<ReturnType<typeof transactionRepository>>;
  });

  const validUpdateData: UpdateTransactionInput = {
    description: 'Transação Atualizada',
    status: 'Pago',
  };

  it('should update transaction and return the updated transaction', async () => {
    const updatedDescription = 'Descrição Atualizada com Sucesso';
    const updatedStatus = 'Pago';
    const dataToUpdate: UpdateTransactionInput = { description: updatedDescription, status: updatedStatus };

    const mockUpdatedTransaction: SelectTransaction = {
      ...mockExistingTransaction,
      description: updatedDescription,
      status: updatedStatus,
      updatedAt: new Date(Date.now() + 1000),
    };

    (mockRepo.findById as vi.Mock)
      .mockResolvedValueOnce(mockExistingTransaction)
      .mockResolvedValueOnce(mockUpdatedTransaction);
    (mockRepo.update as vi.Mock).mockResolvedValue(undefined);

    const result = await updateTransactionUseCase(transactionId, dataToUpdate);

    expect(mockRepo.findById).toHaveBeenCalledTimes(2);
    expect(mockRepo.findById).toHaveBeenNthCalledWith(1, transactionId);

    const expectedParsedData = updateTransactionSchema.parse(dataToUpdate);
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
    expect(mockRepo.update).toHaveBeenCalledWith(transactionId, expectedParsedData);

    expect(mockRepo.findById).toHaveBeenNthCalledWith(2, transactionId);
    expect(result).toEqual(mockUpdatedTransaction);
  });

  it('should not call update if update data is empty or only contains undefined values', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const emptyUpdateData: UpdateTransactionInput = { description: undefined };

    const result = await updateTransactionUseCase(transactionId, emptyUpdateData);

    expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(result).toEqual(mockExistingTransaction);
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

  it('should allow partial updates (e.g., only description), call update, and return updated', async () => {
    const partialUpdate: UpdateTransactionInput = { description: 'Só descrição atualizada' };
    const mockUpdatedTransaction: SelectTransaction = {
      ...mockExistingTransaction,
      ...partialUpdate,
      updatedAt: new Date(Date.now() + 3000),
    };

    (mockRepo.findById as vi.Mock)
      .mockResolvedValueOnce(mockExistingTransaction)
      .mockResolvedValueOnce(mockUpdatedTransaction);
    (mockRepo.update as vi.Mock).mockResolvedValue(undefined);

    const result = await updateTransactionUseCase(transactionId, partialUpdate);

    expect(mockRepo.findById).toHaveBeenCalledTimes(2);
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
    expect(mockRepo.update).toHaveBeenCalledWith(transactionId, updateTransactionSchema.parse(partialUpdate));
    expect(result).toEqual(mockUpdatedTransaction);
  });

   it('should allow updating type and status, calls update, and returns updated', async () => {
    const dataToUpdate: UpdateTransactionInput = { type: 'S', status: 'Cancelado' };
    const mockUpdatedTransaction: SelectTransaction = {
      ...mockExistingTransaction,
      ...dataToUpdate,
       value: mockExistingTransaction.value,
      updatedAt: new Date(Date.now() + 2000),
    };

    (mockRepo.findById as vi.Mock)
      .mockResolvedValueOnce(mockExistingTransaction)
      .mockResolvedValueOnce(mockUpdatedTransaction);
    (mockRepo.update as vi.Mock).mockResolvedValue(undefined);

    const result = await updateTransactionUseCase(transactionId, dataToUpdate);

    expect(mockRepo.findById).toHaveBeenCalledTimes(2);
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
    expect(mockRepo.update).toHaveBeenCalledWith(transactionId, updateTransactionSchema.parse(dataToUpdate));
    expect(result).toEqual(mockUpdatedTransaction);
  });


  it('should throw ZodError for invalid type', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const invalidData = { type: 'X' } as any;

    await expect(updateTransactionUseCase(transactionId, invalidData))
      .rejects.toThrow(ZodError);
  });

  it('should throw ZodError for invalid status', async () => {
    (mockRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    const invalidData = { status: 'Muito Atrasado' } as any;

    await expect(updateTransactionUseCase(transactionId, invalidData))
      .rejects.toThrow(ZodError);
  });
});
