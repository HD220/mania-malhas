import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { faker } from '@faker-js/faker';

// --- START MOCKS ---
vi.mock('@/features/transaction/db/transactionRepository', () => ({
  transactionRepository: vi.fn(() => ({
    insert: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    countAll: vi.fn(),
    update: vi.fn(),
    deleteById: vi.fn(),
  })),
}));

vi.mock('@/features/notification/usecases/createNotificationUseCase', () => ({
  default: vi.fn(),
}));

vi.mock('@/features/notification/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/notification/actions')>();
  return {
    ...actual,
    internalGetUserIdFromSession: vi.fn(),
  };
});
// --- END MOCKS ---


// --- START IMPORTS (after mocks are defined) ---
import createTransactionUseCase, { CreateTransactionInput } from './createTransactionUseCase';
import { transactionRepository } from '@/features/transaction/db/transactionRepository';
import createNotificationUseCaseActual from '@/features/notification/usecases/createNotificationUseCase';
import { internalGetUserIdFromSession as internalGetUserIdFromSessionActual } from '@/features/notification/actions';
import { insertTransactionSchema, SelectTransaction } from '@/features/transaction/schemas/transactionSchema';
import { SelectNotification } from '@/features/notification/schemas/notificationSchema'; // Added this import
// --- END IMPORTS ---

const mockTransactionRepoFactory = transactionRepository as vi.MockedFunction<typeof transactionRepository>;
const mockCreateNotificationUseCase = createNotificationUseCaseActual as vi.Mock;
const mockInternalGetUserIdFromSession = internalGetUserIdFromSessionActual as vi.Mock;

describe('createTransactionUseCase', () => {
  let currentMockRepoMethods: {
    insert: vi.Mock;
    findById: vi.Mock;
    findAll: vi.Mock;
    countAll: vi.Mock;
    update: vi.Mock;
    deleteById: vi.Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    currentMockRepoMethods = mockTransactionRepoFactory();
    mockTransactionRepoFactory.mockClear();
    mockTransactionRepoFactory.mockReturnValue(currentMockRepoMethods);

    mockInternalGetUserIdFromSession.mockResolvedValue(sampleUserId);
    mockCreateNotificationUseCase.mockResolvedValue({} as SelectNotification);
  });

  const sampleUserId = faker.string.uuid();
  const validTransactionData: CreateTransactionInput & { status?: string } = {
    description: 'Nova Transação de Teste',
    value: "123.45",
    type: 'E',
    status: 'Pendente',
    partnerId: faker.string.uuid(),
    date: new Date(),
    due_date: faker.date.future(),
  };

  const createdTransactionId = faker.string.uuid();
  const mockCreatedTransaction: SelectTransaction = {
    id: createdTransactionId,
    description: validTransactionData.description,
    value: 123.45, // Assuming schema coerces string "123.45" to number
    type: validTransactionData.type,
    partnerId: validTransactionData.partnerId,
    date: validTransactionData.date as Date,
    due_date: validTransactionData.due_date as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionId: null,
    status: validTransactionData.status as string, // Added status to match SelectTransaction
  };

  it('should create a transaction, attempt notification, and return the transaction', async () => {
    currentMockRepoMethods.insert.mockResolvedValue({ id: createdTransactionId });
    currentMockRepoMethods.findById.mockResolvedValue(mockCreatedTransaction);

    const result = await createTransactionUseCase(validTransactionData);

    expect(currentMockRepoMethods.insert).toHaveBeenCalledTimes(1);
    const expectedInsertArg = insertTransactionSchema.parse(validTransactionData);
    expect(currentMockRepoMethods.insert).toHaveBeenCalledWith(expectedInsertArg);

    expect(currentMockRepoMethods.findById).toHaveBeenCalledTimes(1);
    expect(currentMockRepoMethods.findById).toHaveBeenCalledWith(createdTransactionId);
    expect(result).toEqual(mockCreatedTransaction);

    expect(mockInternalGetUserIdFromSession).toHaveBeenCalled();
    expect(mockCreateNotificationUseCase).toHaveBeenCalledTimes(1);
    expect(mockCreateNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: sampleUserId,
        type: "new_transaction",
        message: expect.stringContaining(validTransactionData.description as string),
        relatedEntityId: createdTransactionId,
        relatedEntityType: "transaction",
      })
    );
  });

  it('should create transaction even if notification user ID is not found', async () => {
    currentMockRepoMethods.insert.mockResolvedValue({ id: createdTransactionId });
    currentMockRepoMethods.findById.mockResolvedValue(mockCreatedTransaction);
    mockInternalGetUserIdFromSession.mockResolvedValue(null);

    const result = await createTransactionUseCase(validTransactionData);
    expect(result).toEqual(mockCreatedTransaction);
    expect(mockCreateNotificationUseCase).not.toHaveBeenCalled();
  });

  it('should create transaction even if notification creation fails', async () => {
    currentMockRepoMethods.insert.mockResolvedValue({ id: createdTransactionId });
    currentMockRepoMethods.findById.mockResolvedValue(mockCreatedTransaction);
    mockCreateNotificationUseCase.mockRejectedValue(new Error("Notification service down"));

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await createTransactionUseCase(validTransactionData);
    expect(result).toEqual(mockCreatedTransaction);
    expect(mockCreateNotificationUseCase).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to create notification for new transaction:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should throw ZodError if input data is invalid (e.g., value)', async () => {
    const invalidData = { ...validTransactionData, value: "not-a-number-at-all" };
    await expect(createTransactionUseCase(invalidData)).rejects.toThrow(ZodError);
    expect(currentMockRepoMethods.insert).not.toHaveBeenCalled();
  });

  it('should throw ZodError if input data is invalid (e.g., missing description)', async () => {
    const invalidData = { ...validTransactionData, description: "" } as any;
    await expect(createTransactionUseCase(invalidData)).rejects.toThrow(ZodError);
    expect(currentMockRepoMethods.insert).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.insert fails', async () => {
    const dbError = new Error('Database insert failed');
    currentMockRepoMethods.insert.mockRejectedValue(dbError);
    await expect(createTransactionUseCase(validTransactionData)).rejects.toThrow(dbError);
  });

  it('should throw an error if repository.findById fails after successful insert', async () => {
    currentMockRepoMethods.insert.mockResolvedValue({ id: createdTransactionId });
    const findError = new Error('Database findById failed');
    currentMockRepoMethods.findById.mockRejectedValue(findError);
    await expect(createTransactionUseCase(validTransactionData)).rejects.toThrow(findError);
  });

  it('should throw an error if repository.findById returns null after successful insert', async () => {
    currentMockRepoMethods.insert.mockResolvedValue({ id: createdTransactionId });
    currentMockRepoMethods.findById.mockResolvedValue(null);
    await expect(createTransactionUseCase(validTransactionData)).rejects.toThrow(
      "Failed to retrieve the created transaction after insertion."
    );
  });
});
