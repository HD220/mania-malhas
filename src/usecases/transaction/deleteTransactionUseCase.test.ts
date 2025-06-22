import { describe, it, expect, vi, beforeEach } from 'vitest';
import deleteTransactionUseCase from './deleteTransactionUseCase';
import { transactionRepository } from '@/db/repositories/transactionRepository';
import { paymentRepository } from '@/db/repositories/paymentRepository';
import { SelectTransaction } from '@/db/repositories/schemas/transactionSchema';
import { SelectPayment } from '@/db/repositories/schemas/paymentSchema';
// Note: We will import errors using vi.importActual within describe block
import { faker } from '@faker-js/faker';

// Mock repositories
vi.mock('@/db/repositories/transactionRepository');
vi.mock('@/db/repositories/paymentRepository');

describe('deleteTransactionUseCase', async () => {
  // Import actual error classes for instanceof checks and instantiation in mocks
  const { NotFoundError, InvalidOperationError } = await vi.importActual<typeof import('@/lib/errors/domainErrors')>('@/lib/errors/domainErrors');

  let mockTransactionRepo: ReturnType<ReturnType<typeof transactionRepository>>;
  let mockPaymentRepo: ReturnType<ReturnType<typeof paymentRepository>>;
  const transactionId = faker.string.uuid();

  const mockExistingTransaction: SelectTransaction = {
    id: transactionId,
    description: 'Transação para Deletar',
    value: "50.00",
    type: 'S',
    status: 'Pendente',
    partnerId: faker.string.uuid(),
    date: new Date(),
    due_date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionId: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations for repository methods
    mockTransactionRepo = {
      findById: vi.fn(),
      deleteById: vi.fn(),
      // Add other methods to satisfy the type, if necessary for stricter typing,
      // or ensure the mocked factory returns this specific shape.
      insert: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      countAll: vi.fn(),
    };
    (transactionRepository as vi.Mock).mockReturnValue(mockTransactionRepo);

    mockPaymentRepo = {
      findByTransactionId: vi.fn(),
      // Add other methods if needed
      insert: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      findAllByTransactionIds: vi.fn(),
    };
    (paymentRepository as vi.Mock).mockReturnValue(mockPaymentRepo);
  });

  it('should successfully delete a transaction if it exists and has no associated payments', async () => {
    (mockTransactionRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    (mockPaymentRepo.findByTransactionId as vi.Mock).mockResolvedValue([]); // No payments
    (mockTransactionRepo.deleteById as vi.Mock).mockResolvedValue(undefined);

    await expect(deleteTransactionUseCase(transactionId)).resolves.toBeUndefined();

    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockPaymentRepo.findByTransactionId).toHaveBeenCalledWith(transactionId);
    expect(mockTransactionRepo.deleteById).toHaveBeenCalledWith(transactionId);
  });

  it('should throw NotFoundError if the transaction does not exist', async () => {
    (mockTransactionRepo.findById as vi.Mock).mockResolvedValue(null);

    await expect(deleteTransactionUseCase(transactionId)).rejects.toThrow(NotFoundError);
    await expect(deleteTransactionUseCase(transactionId)).rejects.toThrow("Transação não encontrada.");

    expect(mockPaymentRepo.findByTransactionId).not.toHaveBeenCalled();
    expect(mockTransactionRepo.deleteById).not.toHaveBeenCalled();
  });

  it('should throw InvalidOperationError if the transaction has associated payments', async () => {
    const mockPayment: SelectPayment = {
      id: faker.string.uuid(),
      transactionId: transactionId,
      value: "50.00",
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (mockTransactionRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    (mockPaymentRepo.findByTransactionId as vi.Mock).mockResolvedValue([mockPayment]);

    const expectedErrorMessage = "Não é possível excluir transação pois existem pagamentos associados. Cancele ou desvincule os pagamentos primeiro.";
    // Use vi.importActual for the error class in assertions
    const { InvalidOperationError: ActualInvalidOperationError } = await vi.importActual<typeof import('@/lib/errors/domainErrors')>('@/lib/errors/domainErrors');

    await expect(deleteTransactionUseCase(transactionId))
      .rejects.toThrow(ActualInvalidOperationError);
    await expect(deleteTransactionUseCase(transactionId))
      .rejects.toThrow(expectedErrorMessage);

    expect(mockTransactionRepo.deleteById).not.toHaveBeenCalled();
  });

  it('should throw an error if transactionRepo.deleteById fails', async () => {
    const dbError = new Error('Database deletion failed');
    (mockTransactionRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    (mockPaymentRepo.findByTransactionId as vi.Mock).mockResolvedValue([]);
    (mockTransactionRepo.deleteById as vi.Mock).mockRejectedValue(dbError);

    await expect(deleteTransactionUseCase(transactionId)).rejects.toThrow(dbError);
  });

  it('should throw an error if paymentRepo.findByTransactionId fails', async () => {
    const dbError = new Error('Failed to fetch payments');
    (mockTransactionRepo.findById as vi.Mock).mockResolvedValue(mockExistingTransaction);
    (mockPaymentRepo.findByTransactionId as vi.Mock).mockRejectedValue(dbError);

    await expect(deleteTransactionUseCase(transactionId)).rejects.toThrow(dbError);
    expect(mockTransactionRepo.deleteById).not.toHaveBeenCalled();
  });
});
