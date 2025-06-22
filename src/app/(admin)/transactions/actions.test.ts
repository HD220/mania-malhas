import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTransactionsAction, TransactionServerResponse } from './actions';
import getTransactionsUseCase, { PaginatedTransactionsResult, GetTransactionsFilters, UseCasePaginationParams, UseCaseOrderByParams } from '@/usecases/transaction/getTransactionsUseCase';
import { TransactionWithPartner } from '@/db/repositories/transactionRepository';
import { faker } from '@faker-js/faker';

import { unstable_noStore } from 'next/cache'; // Importar diretamente

// Mock do getTransactionsUseCase
vi.mock('@/usecases/transaction/getTransactionsUseCase');

// Mock de next/cache
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    unstable_noStore: vi.fn(),
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
    expect(unstable_noStore).toHaveBeenCalled(); // Usar importado
  });
});
