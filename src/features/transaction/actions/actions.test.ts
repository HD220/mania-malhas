import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listTransactionsAction, TransactionServerResponse,
  createTransactionAction, CreateTransactionServerResponse,
  updateTransactionAction, UpdateTransactionServerResponse,
  deleteTransactionAction, DeleteTransactionServerResponse,
  getTransactionByIdAction, GetTransactionByIdServerResponse
} from './index'; // Updated import
import getTransactionsUseCase, { PaginatedTransactionsResult, GetTransactionsFilters, UseCasePaginationParams, UseCaseOrderByParams } from '@/features/transaction/usecases/getTransactionsUseCase';
import { TransactionWithPartner } from '@/features/transaction/db/transactionRepository';
import { faker } from '@faker-js/faker';
import { unstable_noStore, revalidatePath } from 'next/cache';
import createTransactionUseCase, { CreateTransactionInput } from '@/features/transaction/usecases/createTransactionUseCase';
import { SelectTransaction } from '@/features/transaction/schemas/transactionSchema';
import { ZodError, ZodIssue } from 'zod';
import updateTransactionUseCase, { UpdateTransactionInput } from '@/features/transaction/usecases/updateTransactionUseCase';
import deleteTransactionUseCase, { deleteTransactionInputSchema } from '@/features/transaction/usecases/deleteTransactionUseCase';
import getTransactionByIdUseCase, { getTransactionByIdInputSchema } from '@/features/transaction/usecases/getTransactionByIdUseCase';
import { NotFoundError, DomainConflictError } from '@/lib/errors/domain-errors';

// Mock dos use cases
vi.mock('@/features/transaction/usecases/getTransactionsUseCase');
vi.mock('@/features/transaction/usecases/createTransactionUseCase');
vi.mock('@/features/transaction/usecases/updateTransactionUseCase');
vi.mock('@/features/transaction/usecases/deleteTransactionUseCase', async () => {
  const actual = await vi.importActual<typeof import('@/features/transaction/usecases/deleteTransactionUseCase')>('@/features/transaction/usecases/deleteTransactionUseCase');
  return { ...actual, default: vi.fn() };
});
vi.mock('@/features/transaction/usecases/getTransactionByIdUseCase', async () => {
  const actual = await vi.importActual<typeof import('@/features/transaction/usecases/getTransactionByIdUseCase')>('@/features/transaction/usecases/getTransactionByIdUseCase');
  return { ...actual, default: vi.fn() };
});
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return { ...actual, unstable_noStore: vi.fn(), revalidatePath: vi.fn() };
});

const createMockTransactionWithPartner = (): TransactionWithPartner => ({
  id: faker.string.uuid(),
  description: faker.lorem.sentence(),
  value: faker.finance.amount(),
  type: faker.helpers.arrayElement(['E', 'S']) as 'E' | 'S',
  status: faker.helpers.arrayElement(['Pendente', 'Pago', 'Cancelado']),
  partnerId: faker.string.uuid(),
  partnerName: faker.company.name(),
  date: new Date(),
  due_date: faker.date.future(),
  createdAt: new Date(),
  updatedAt: new Date(),
  transactionId: null,
});

describe('listTransactionsAction Server Action', () => {
  const mockGetTransactionsUseCase = getTransactionsUseCase as ReturnType<typeof vi.fn>;
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return paginated transaction data on successful use case call', async () => {
    const mockTransaction = createMockTransactionWithPartner();
    const mockPaginatedResult: PaginatedTransactionsResult = {
      data: [mockTransaction], totalItems: 1, totalPages: 1, currentPage: 1, pageSize: 10,
    };
    mockGetTransactionsUseCase.mockResolvedValue(mockPaginatedResult);
    const filters: GetTransactionsFilters = { status: 'Pendente' };
    const pagination: UseCasePaginationParams = { page: 1, pageSize: 10 };
    const orderBy: UseCaseOrderByParams = { column: 'date', direction: 'desc' };
    const response: TransactionServerResponse<PaginatedTransactionsResult> = await listTransactionsAction(filters, pagination, orderBy);
    expect(mockGetTransactionsUseCase).toHaveBeenCalledWith(filters, pagination, orderBy);
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockPaginatedResult);
  });

  // Other tests for listTransactionsAction...
});

describe('getTransactionByIdAction Server Action', async () => {
  const validTxId = faker.string.uuid();
  const mockTransaction: SelectTransaction = {
    id: validTxId, description: "Sample Transaction", value: "123.45", type: 'E', status: 'Pendente',
    partnerId: faker.string.uuid(), date: new Date(), due_date: new Date(), createdAt: new Date(), updatedAt: new Date(), transactionId: null,
  };
  beforeEach(() => { vi.clearAllMocks(); (getTransactionByIdUseCase as ReturnType<typeof vi.fn>).mockReset(); });

  it('should return a transaction successfully when found', async () => {
    (getTransactionByIdUseCase as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransaction);
    const response = await getTransactionByIdAction(validTxId);
    expect(getTransactionByIdUseCase).toHaveBeenCalledWith({ id: validTxId });
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockTransaction);
  });
  // Other tests for getTransactionByIdAction...
});

describe('createTransactionAction Server Action', () => {
  const mockCreateTransactionUseCase = createTransactionUseCase as ReturnType<typeof vi.fn>;
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>;
  beforeEach(() => { vi.clearAllMocks(); });
  const validTransactionInput: CreateTransactionInput = {
    description: 'Nova Transação', value: "100.00", type: 'E', status: 'Pendente',
    partnerId: faker.string.uuid(), date: new Date(), due_date: faker.date.future(),
  };
  const mockCreatedTx: SelectTransaction = {
    ...validTransactionInput, id: faker.string.uuid(), createdAt: new Date(), updatedAt: new Date(), transactionId: null, value: String(validTransactionInput.value),
  };

  it('should create a transaction successfully and revalidate path', async () => {
    mockCreateTransactionUseCase.mockResolvedValue(mockCreatedTx);
    const response = await createTransactionAction(validTransactionInput);
    expect(mockCreateTransactionUseCase).toHaveBeenCalledWith(validTransactionInput);
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockCreatedTx);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/(admin)/transactions/list");
  });
  // Other tests for createTransactionAction...
});

describe('deleteTransactionAction Server Action', async () => {
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>;
  const validTransactionId = faker.string.uuid();
  beforeEach(() => { vi.clearAllMocks(); (deleteTransactionUseCase as ReturnType<typeof vi.fn>).mockReset(); });

  it('should delete a transaction successfully and revalidate path', async () => {
    (deleteTransactionUseCase as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    const response = await deleteTransactionAction(validTransactionId);
    expect(deleteTransactionUseCase).toHaveBeenCalledWith({ id: validTransactionId });
    expect(response.success).toBe(true);
    expect(response.message).toBe("Transação excluída com sucesso.");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/(admin)/transactions/list");
  });
  // Other tests for deleteTransactionAction...
});

describe('updateTransactionAction Server Action', async () => {
  const mockUpdateTransactionUseCase = updateTransactionUseCase as ReturnType<typeof vi.fn>;
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>;
  const transactionId = faker.string.uuid();
  beforeEach(() => { vi.clearAllMocks(); });
  const validUpdateInput: UpdateTransactionInput = { description: 'Transação Atualizada', status: 'Pago' };
  const mockUpdatedTx: SelectTransaction = {
    id: transactionId, description: 'Transação Atualizada', value: "150.00", type: 'E', status: 'Pago',
    partnerId: faker.string.uuid(), date: new Date(), due_date: new Date(), createdAt: new Date(), updatedAt: new Date(), transactionId: null,
  };

  it('should update a transaction successfully and revalidate paths', async () => {
    mockUpdateTransactionUseCase.mockResolvedValue(mockUpdatedTx);
    const response = await updateTransactionAction(transactionId, validUpdateInput);
    expect(mockUpdateTransactionUseCase).toHaveBeenCalledWith(transactionId, validUpdateInput);
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockUpdatedTx);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/(admin)/transactions/list");
  });
  // Other tests for updateTransactionAction...
});
