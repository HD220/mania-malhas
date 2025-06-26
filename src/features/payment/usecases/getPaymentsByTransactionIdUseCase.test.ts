import { describe, it, expect, vi, beforeEach } from 'vitest';
import getPaymentsByTransactionIdUseCase from './getPaymentsByTransactionIdUseCase';
import { paymentRepository } from '@/features/payment/db/payment-repository';
import { SelectPayment } from '@/features/payment/schemas/paymentSchema';
import { faker } from '@faker-js/faker';

// Mock do paymentRepository
vi.mock('@/features/payment/db/payment-repository', () => ({
  paymentRepository: vi.fn().mockReturnValue({
    findByTransactionId: vi.fn(),
  }),
}));

const createMockPayment = (transactionId: string): SelectPayment => ({
  id: faker.string.uuid(),
  transactionId,
  value: faker.finance.amount(),
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('getPaymentsByTransactionIdUseCase', () => {
  let mockPaymentRepo: ReturnType<typeof paymentRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPaymentRepo = paymentRepository(vi.fn() as any);
  });

  it('should return payments for a valid transaction ID', async () => {
    const transactionId = faker.string.uuid();
    const mockPaymentsList = [createMockPayment(transactionId), createMockPayment(transactionId)];
    (mockPaymentRepo.findByTransactionId as ReturnType<typeof vi.fn>).mockResolvedValue(mockPaymentsList);

    const result = await getPaymentsByTransactionIdUseCase(transactionId);

    expect(mockPaymentRepo.findByTransactionId).toHaveBeenCalledWith(transactionId);
    expect(result).toEqual(mockPaymentsList);
    expect(result.length).toBe(2);
  });

  it('should return an empty array if no payments are found for the transaction ID', async () => {
    const transactionId = faker.string.uuid();
    (mockPaymentRepo.findByTransactionId as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await getPaymentsByTransactionIdUseCase(transactionId);

    expect(mockPaymentRepo.findByTransactionId).toHaveBeenCalledWith(transactionId);
    expect(result).toEqual([]);
  });

  it('should return an empty array for an empty transaction ID string and log a warning', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getPaymentsByTransactionIdUseCase('');

    expect(result).toEqual([]);
    expect(mockPaymentRepo.findByTransactionId).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith("getPaymentsByTransactionIdUseCase called with invalid transactionId: ''");
    consoleWarnSpy.mockRestore();
  });

  it('should return an empty array for a null transaction ID and log a warning', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // @ts-expect-error Testando input nulo
    const result = await getPaymentsByTransactionIdUseCase(null);

    expect(result).toEqual([]);
    expect(mockPaymentRepo.findByTransactionId).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith("getPaymentsByTransactionIdUseCase called with invalid transactionId: 'null'");
    consoleWarnSpy.mockRestore();
  });

  it('should throw an error if the repository call fails', async () => {
    const transactionId = faker.string.uuid();
    const repositoryError = new Error('Database query failed');
    (mockPaymentRepo.findByTransactionId as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    await expect(getPaymentsByTransactionIdUseCase(transactionId)).rejects.toThrow(repositoryError);
    expect(mockPaymentRepo.findByTransactionId).toHaveBeenCalledWith(transactionId);
  });
});
