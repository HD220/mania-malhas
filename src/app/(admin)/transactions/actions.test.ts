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
import updateTransactionUseCase, { UpdateTransactionInput } from '@/usecases/transaction/updateTransactionUseCase';
import { updateTransactionAction, UpdateTransactionServerResponse } from './actions';

// Import deleteTransactionUseCase with its input schema
import deleteTransactionUseCase, { deleteTransactionInputSchema } from '@/usecases/transaction/deleteTransactionUseCase';
import { deleteTransactionAction, DeleteTransactionServerResponse } from './actions';

// Import getTransactionByIdUseCase and its types/action
import getTransactionByIdUseCase, { getTransactionByIdInputSchema } from '@/usecases/transaction/getTransactionByIdUseCase';
import { getTransactionByIdAction, GetTransactionByIdServerResponse } from './actions';

// Specific error types (NotFoundError, DomainConflictError, ZodError) will be imported via vi.importActual or are standard

// Mock dos use cases
vi.mock('@/usecases/transaction/getTransactionsUseCase');
vi.mock('@/usecases/transaction/createTransactionUseCase');
vi.mock('@/usecases/transaction/updateTransactionUseCase');

// Mock deleteTransactionUseCase (default export) but keep named exports (like schema) real
vi.mock('@/usecases/transaction/deleteTransactionUseCase', async () => {
  const actual = await vi.importActual<typeof import('@/usecases/transaction/deleteTransactionUseCase')>('@/usecases/transaction/deleteTransactionUseCase');
  return {
    ...actual, // Includes actual deleteTransactionInputSchema
    default: vi.fn(), // Mocks the default export (deleteTransactionUseCase function)
  };
});

// Mock getTransactionByIdUseCase (default export) but keep named exports (like schema) real
vi.mock('@/usecases/transaction/getTransactionByIdUseCase', async () => {
  const actual = await vi.importActual<typeof import('@/usecases/transaction/getTransactionByIdUseCase')>('@/usecases/transaction/getTransactionByIdUseCase');
  return {
    ...actual, // Includes actual getTransactionByIdInputSchema
    default: vi.fn(), // Mocks the default export (getTransactionByIdUseCase function)
  };
});


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

describe('getTransactionByIdAction Server Action', async () => {
  const { NotFoundError } = await vi.importActual<typeof import('@/lib/errors/domainErrors')>('@/lib/errors/domainErrors');
  // getTransactionByIdUseCase is already mocked by vi.mock at the top level
  const validTxId = faker.string.uuid();

  const mockTransaction: SelectTransaction = {
    id: validTxId,
    description: "Sample Transaction",
    value: "123.45", // Assuming string value from DB schema, use case might coerce
    type: 'E',
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
    (getTransactionByIdUseCase as ReturnType<typeof vi.fn>).mockReset();
  });

  it('should return a transaction successfully when found', async () => {
    (getTransactionByIdUseCase as ReturnType<typeof vi.fn>).mockResolvedValue(mockTransaction);

    const response = await getTransactionByIdAction(validTxId);

    expect(getTransactionByIdUseCase).toHaveBeenCalledWith({ id: validTxId });
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockTransaction);
    expect(response.message).toBeUndefined();
  });

  it('should return an error message if ID is invalid (ZodError from action)', async () => {
    const invalidTxId = "not-a-uuid";
    // Action calls getTransactionByIdInputSchema.parse directly

    const response = await getTransactionByIdAction(invalidTxId);

    expect(response.success).toBe(false);
    expect(response.message).toBe("ID da transação inválido.");
    expect(getTransactionByIdUseCase).not.toHaveBeenCalled();
  });

  it('should return NotFoundError if use case throws NotFoundError', async () => {
    const errorMessage = `Transação com ID ${validTxId} não encontrada.`;
    (getTransactionByIdUseCase as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError(`Transação com ID ${validTxId}`));

    const response = await getTransactionByIdAction(validTxId);

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(getTransactionByIdUseCase).toHaveBeenCalledWith({ id: validTxId });
  });

  it('should return a generic error message if use case throws an unexpected error', async () => {
    const genericErrorMessage = "Falha ao buscar transação.";
    (getTransactionByIdUseCase as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(genericErrorMessage));

    const response = await getTransactionByIdAction(validTxId);

    expect(response.success).toBe(false);
    expect(response.message).toBe(genericErrorMessage);
    expect(getTransactionByIdUseCase).toHaveBeenCalledWith({ id: validTxId });
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

describe('deleteTransactionAction Server Action', async () => {
  const { NotFoundError, DomainConflictError } = await vi.importActual<typeof import('@/lib/errors/domainErrors')>('@/lib/errors/domainErrors');
  // deleteTransactionUseCase is already mocked by vi.mock at the top level
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>; // Correctly typed mock
  const validTransactionId = faker.string.uuid();

  beforeEach(() => {
    vi.clearAllMocks();
    // Resetting the mock implementation if necessary, or just clear calls.
    // The mock itself is persistent due to vi.mock.
    (deleteTransactionUseCase as ReturnType<typeof vi.fn>).mockReset();
  });

  it('should delete a transaction successfully and revalidate path', async () => {
    (deleteTransactionUseCase as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    const response = await deleteTransactionAction(validTransactionId);

    expect(deleteTransactionUseCase).toHaveBeenCalledWith({ id: validTransactionId });
    expect(response.success).toBe(true);
    expect(response.message).toBe("Transação excluída com sucesso.");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/(admin)/transactions/list");
  });

  it('should return validation error if ID is invalid (ZodError from action)', async () => {
    const invalidTransactionId = "not-a-uuid";
    // The action itself calls deleteTransactionInputSchema.parse.
    // No need to mock the use case throwing ZodError here, the action's parse will throw.

    const response = await deleteTransactionAction(invalidTransactionId);

    expect(response.success).toBe(false);
    expect(response.message).toBe("ID da transação inválido.");
    expect(deleteTransactionUseCase).not.toHaveBeenCalled(); // Check the actual mock
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });


  it('should return NotFoundError if use case throws NotFoundError', async () => {
    const resourceName = `Transaction with ID ${validTransactionId}`;
    const expectedErrorMessage = `${resourceName} não encontrada.`; // Adjusted to Portuguese
    (deleteTransactionUseCase as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError(resourceName));

    const response = await deleteTransactionAction(validTransactionId);

    expect(response.success).toBe(false);
    expect(response.message).toBe(expectedErrorMessage);
    expect(deleteTransactionUseCase).toHaveBeenCalledWith({ id: validTransactionId }); // Check the actual mock
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return DomainConflictError if use case throws DomainConflictError (e.g. has payments)', async () => {
    const errorMessage = `Transaction with ID ${validTransactionId} cannot be deleted because it has 1 associated payment(s).`;
    (deleteTransactionUseCase as ReturnType<typeof vi.fn>).mockRejectedValue(new DomainConflictError(errorMessage));

    const response = await deleteTransactionAction(validTransactionId);

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(deleteTransactionUseCase).toHaveBeenCalledWith({ id: validTransactionId }); // Check the actual mock
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return a generic error message if use case throws an unexpected generic error', async () => {
    const errorMessage = 'Erro genérico ao excluir transação';
    (deleteTransactionUseCase as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

    const response = await deleteTransactionAction(validTransactionId);

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(deleteTransactionUseCase).toHaveBeenCalledWith({ id: validTransactionId }); // Check the actual mock
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});

describe('updateTransactionAction Server Action', async () => {
  const { NotFoundError } = await vi.importActual<typeof import('@/lib/errors/domainErrors')>('@/lib/errors/domainErrors');
  const mockUpdateTransactionUseCase = updateTransactionUseCase as ReturnType<typeof vi.fn>;
  const mockRevalidatePath = revalidatePath as ReturnType<typeof vi.fn>;
  const transactionId = faker.string.uuid();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validUpdateInput: UpdateTransactionInput = {
    description: 'Transação Atualizada',
    status: 'Pago',
  };

  const mockUpdatedTx: SelectTransaction = {
    id: transactionId,
    description: 'Transação Atualizada',
    value: "150.00",
    type: 'E',
    status: 'Pago',
    partnerId: faker.string.uuid(),
    date: new Date(),
    due_date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionId: null,
  };

  it('should update a transaction successfully and revalidate paths', async () => {
    mockUpdateTransactionUseCase.mockResolvedValue(mockUpdatedTx);

    const response = await updateTransactionAction(transactionId, validUpdateInput);

    expect(mockUpdateTransactionUseCase).toHaveBeenCalledWith(transactionId, validUpdateInput);
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockUpdatedTx);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/(admin)/transactions/list");
    // expect(mockRevalidatePath).toHaveBeenCalledWith(`/(admin)/transactions/${transactionId}/edit`); // If this page existed
  });

  it('should return NotFoundError if use case throws NotFoundError', async () => {
    const resourceName = "Transação não encontrada."; // This is the resource name passed to NotFoundError
    const expectedErrorMessage = `${resourceName} não encontrada.`; // Error class appends " não encontrada."
    mockUpdateTransactionUseCase.mockRejectedValue(new NotFoundError(resourceName));

    const response = await updateTransactionAction(transactionId, validUpdateInput);

    expect(response.success).toBe(false);
    expect(response.message).toBe(expectedErrorMessage);
    expect(response.data).toBeUndefined();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return validation errors if use case throws ZodError', async () => {
    const fieldErrors: Partial<Record<keyof UpdateTransactionInput, string[]>> = {
      value: ["Valor precisa ser um número positivo"],
    };
    const zodError = new ZodError([]);
    zodError.flatten = vi.fn().mockReturnValue({ fieldErrors, formErrors: [] });
    mockUpdateTransactionUseCase.mockRejectedValue(zodError);

    const response = await updateTransactionAction(transactionId, validUpdateInput);

    expect(response.success).toBe(false);
    expect(response.message).toBe("Erro de validação.");
    expect(response.errors).toEqual(fieldErrors);
    expect(response.data).toBeUndefined();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should return a generic error message if use case throws a non-Zod/non-NotFoundError', async () => {
    const errorMessage = 'Erro genérico ao atualizar transação';
    mockUpdateTransactionUseCase.mockRejectedValue(new Error(errorMessage));

    const response = await updateTransactionAction(transactionId, validUpdateInput);

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(response.data).toBeUndefined();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
