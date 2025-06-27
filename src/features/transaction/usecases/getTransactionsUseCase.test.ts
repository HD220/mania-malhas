import { faker } from '@faker-js/faker';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { transactionRepository } from '@/features/transaction/db/transactionRepository';
import { TransactionWithPartner } from '@/features/transaction/types/transaction.types'; // Corrected path

import getTransactionsUseCase from './getTransactionsUseCase';

// Mock do transactionRepository
vi.mock('@/features/transaction/db/transactionRepository', () => ({
  transactionRepository: vi.fn().mockReturnValue({
    findAll: vi.fn(),
    countAll: vi.fn(),
  }),
}));

const mockTransaction: TransactionWithPartner = {
  id: 'txn_1',
  description: 'Test Transaction',
  value: "100.00",
  type: 'E',
  status: 'Pendente',
  partnerId: 'partner_1',
  partnerName: 'Test Partner',
  date: new Date('2023-01-15'),
  due_date: new Date('2023-01-20'),
  createdAt: new Date(),
  updatedAt: new Date(),
  transactionId: null,
};

describe('getTransactionsUseCase', () => {
  let mockTransactionRepo: ReturnType<typeof transactionRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactionRepo = transactionRepository(vi.fn() as any);
  });

  it('should fetch transactions with default pagination and no filters', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransaction]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await getTransactionsUseCase();

    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      {},
      { offset: 0, limit: 10 },
      undefined
    );
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith({});
    expect(result.data).toEqual([mockTransaction]);
    expect(result.totalItems).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('should fetch transactions with specified filters (type and status)', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransaction]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const filters = { type: 'E' as 'E' | 'S', status: 'Pendente' };
    await getTransactionsUseCase(filters);

    const expectedRepoFilters = { type: 'E', status: 'Pendente' };
    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      expectedRepoFilters,
      { offset: 0, limit: 10 },
      undefined
    );
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith(expectedRepoFilters);
  });

  it('should fetch transactions with description filter', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransaction]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const filters = { description: 'Test Transaction' };
    await getTransactionsUseCase(filters);

    const expectedRepoFilters = { description: 'Test Transaction' };
    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      expectedRepoFilters,
      { offset: 0, limit: 10 },
      undefined
    );
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith(expectedRepoFilters);
  });

  it('should fetch transactions with specified pagination', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(25);

    const pagination = { page: 2, pageSize: 5 };
    const result = await getTransactionsUseCase(undefined, pagination);

    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      {},
      { offset: 5, limit: 5 },
      undefined
    );
    expect(result.currentPage).toBe(2);
    expect(result.pageSize).toBe(5);
    expect(result.totalPages).toBe(5);
  });

  it('should apply application-level filters for partnerId and dates', async () => {
    const createBaseMockTransaction = (): TransactionWithPartner => ({
      id: faker.string.uuid(),
      description: 'Base Test Transaction',
      value: "100.00",
      type: 'E',
      status: 'Pendente',
      partnerId: faker.string.uuid(),
      partnerName: 'Base Partner',
      date: new Date('2023-01-01'),
      due_date: new Date('2023-01-05'),
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionId: null,
    });

    const transactionsFromRepo = [
      { ...createBaseMockTransaction(), id: 'txn_1', partnerId: 'partner_A', date: new Date('2023-01-10') },
      { ...createBaseMockTransaction(), id: 'txn_2', partnerId: 'partner_B', date: new Date('2023-01-15') },
      { ...createBaseMockTransaction(), id: 'txn_3', partnerId: 'partner_A', date: new Date('2023-01-20') },
    ];

    const mockRepoImplementation = async (repoFilters: any) => {
      let data = [...transactionsFromRepo];
      if (repoFilters?.dateFrom) {
        data = data.filter(t => t.date.getTime() >= repoFilters.dateFrom!.getTime());
      }
      if (repoFilters?.dateTo) {
        data = data.filter(t => t.date.getTime() <= repoFilters.dateTo!.getTime());
      }
      if (repoFilters?.partnerId) {
        data = data.filter(t => t.partnerId === repoFilters.partnerId);
      }
      return data;
    };

    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockImplementation(async (repoFilters) => mockRepoImplementation(repoFilters));
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockImplementation(async (repoFilters) => (await mockRepoImplementation(repoFilters)).length);

    const filters = { partnerId: 'partner_A', dateFrom: new Date('2023-01-01'), dateTo: new Date('2023-01-15') };
    const result = await getTransactionsUseCase(filters);

    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('txn_1');

    const expectedRepoFilters = {
      partnerId: filters.partnerId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    };
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith(expectedRepoFilters);
    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining(expectedRepoFilters),
      expect.objectContaining({ offset: 0, limit: 10 }),
      undefined
    );
  });

  it('should filter by partnerId (via repo)', async () => {
    const createBase = (): TransactionWithPartner => ({
      id: faker.string.uuid(), description: 'Test', value: "100", type: 'E', status: 'Pendente',
      partnerId: faker.string.uuid(), partnerName: 'Test Partner', date: new Date(),
      due_date: new Date(), createdAt: new Date(), updatedAt: new Date(), transactionId: null,
    });
    const allTransactions = [
      { ...createBase(), id: 'partner_ok', partnerId: 'partner_A_test' },
      { ...createBase(), id: 'partner_wrong', partnerId: 'partner_B_test' },
    ];

    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockImplementation(async (repoFilters) => {
      if (repoFilters?.partnerId) {
        return allTransactions.filter(t => t.partnerId === repoFilters.partnerId);
      }
      return allTransactions;
    });
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockImplementation(async (repoFilters) => {
      if (repoFilters?.partnerId) {
        return allTransactions.filter(t => t.partnerId === repoFilters.partnerId).length;
      }
      return allTransactions.length;
    });

    const filters = { partnerId: 'partner_A_test' };
    const result = await getTransactionsUseCase(filters);
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('partner_ok');
    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ partnerId: 'partner_A_test' }),
      expect.any(Object),
      undefined
    );
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith(
      expect.objectContaining({ partnerId: 'partner_A_test' })
    );
  });

  it('should return empty data and correct pagination if repository throws error', async () => {
    const repositoryError = new Error('DB Query Failed');
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    await expect(getTransactionsUseCase()).rejects.toThrow(repositoryError);
  });

  it('should calculate totalPages correctly', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(23);
    const pagination = { pageSize: 10 };
    const result = await getTransactionsUseCase(undefined, pagination);
    expect(result.totalPages).toBe(3);

    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(20);
    const result2 = await getTransactionsUseCase(undefined, pagination);
    expect(result2.totalPages).toBe(2);

    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    const result3 = await getTransactionsUseCase(undefined, pagination);
    expect(result3.totalPages).toBe(0);
  });
});
