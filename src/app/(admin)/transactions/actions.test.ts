import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTransactionsAction, TransactionServerResponse } from './actions';
import getTransactionsUseCase, { PaginatedTransactionsResult, GetTransactionsFilters, UseCasePaginationParams, UseCaseOrderByParams } from '@/usecases/transaction/getTransactionsUseCase';
import { TransactionWithPartner } from '@/db/repositories/transactionRepository';
import { faker } from '@faker-js/faker';

import { unstable_noStore } from 'next/cache'; // Importar diretamente

import createTransactionUseCase, { CreateTransactionInput } from '@/usecases/transaction/createTransactionUseCase';
import { SelectTransaction } from '@/db/repositories/schemas/transactionSchema';
import { ZodError, ZodIssue } from 'zod';
import { revalidatePath } from 'next/cache';
import { createTransactionAction, CreateTransactionServerResponse } from './actions';


// Mock dos use cases
vi.mock('@/usecases/transaction/getTransactionsUseCase');
vi.mock('@/usecases/transaction/createTransactionUseCase');

// Mock de next/cache
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    unstable_noStore: vi.fn(),
    revalidatePath: vi.fn(), // Mock revalidatePath
  };
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated transaction data on successful use case call', async () => {
    const mockTransaction = createMockTransactionWithPartner();
    const mockPaginatedResult: PaginatedTransactionsResult = {
      data: [mockTransaction],
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
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

  it('should correctly pass description filter to use case', async () => {
    const mockTransaction = createMockTransactionWithPartner();
    const mockPaginatedResult: PaginatedTransactionsResult = {
      data: [mockTransaction],
      totalItems: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    };
    mockGetTransactionsUseCase.mockResolvedValue(mockPaginatedResult);

    const filters: GetTransactionsFilters = { description: 'Test Desc' };
    const pagination: UseCasePaginationParams = { page: 1, pageSize: 10 };
    const orderBy: UseCaseOrderByParams = { column: 'date', direction: 'desc' };

    const response = await listTransactionsAction(filters, pagination, orderBy);

    expect(mockGetTransactionsUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Test Desc' }),
      pagination,
      orderBy
    );
    expect(response.message).toBeUndefined();
  });

  it('should return success false and an error message if use case throws an error', async () => {
    const errorMessage = 'Error fetching transactions from use case';
    mockGetTransactionsUseCase.mockRejectedValue(new Error(errorMessage));

    const response: TransactionServerResponse<PaginatedTransactionsResult> = await listTransactionsAction();

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(response.data?.data).toEqual([]); // Action retorna estrutura padrão em caso de erro
    expect(response.data?.totalItems).toBe(0);
  });

  it('should call unstable_noStore', async () => {
    mockGetTransactionsUseCase.mockResolvedValue({ data: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 });
    await listTransactionsAction();
    expect(unstable_noStore).toHaveBeenCalled();
  });
});

describe('createTransactionAction Server Action', () => {
  const mockCreateTransactionUseCase = createTransactionUseCase as ReturnType<typeof vi.fn>;
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validTransactionInput: CreateTransactionInput = {
    description: 'Nova Transação',
    value: "100.00",
    type: 'E',
    status: 'Pendente',
    partnerId: faker.string.uuid(),
    date: new Date(),
    due_date: faker.date.future(),
  };

  const mockCreatedTx: SelectTransaction = {
    ...validTransactionInput,
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionId: null,
    // Ensure value is string as per SelectTransaction if it differs from CreateTransactionInput's value type
    value: String(validTransactionInput.value),
  };


  it('should create a transaction successfully and revalidate path', async () => {
    mockCreateTransactionUseCase.mockResolvedValue(mockCreatedTx);

    const response = await createTransactionAction(validTransactionInput);

    expect(mockCreateTransactionUseCase).toHaveBeenCalledWith(validTransactionInput);
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockCreatedTx);
    expect(response.message).toBeUndefined();
    expect(response.errors).toBeUndefined();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/(admin)/transactions/list");
  });

  it('should return validation errors if use case throws ZodError', async () => {
    const fieldErrors: Partial<Record<keyof CreateTransactionInput, string[]>> = {
      value: ["Valor inválido"],
    };
    const zodError = new ZodError([]); // Simplified; actual ZodError would have issues
    zodError.flatten = vi.fn().mockReturnValue({ fieldErrors, formErrors: [] }); // Mock flatten

    mockCreateTransactionUseCase.mockRejectedValue(zodError);

    const response = await createTransactionAction(validTransactionInput);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Erro de validação.");
    expect(response.errors).toEqual(fieldErrors);
    expect(response.data).toBeUndefined();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return a generic error message if use case throws a non-Zod error', async () => {
    const errorMessage = 'Falha no banco de dados ao criar transação';
    mockCreateTransactionUseCase.mockRejectedValue(new Error(errorMessage));

    const response = await createTransactionAction(validTransactionInput);

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(response.errors).toBeUndefined();
    expect(response.data).toBeUndefined();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
