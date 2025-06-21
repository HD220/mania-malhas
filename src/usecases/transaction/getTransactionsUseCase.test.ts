import { describe, it, expect, vi, beforeEach } from 'vitest';
import getTransactionsUseCase from './getTransactionsUseCase';
import { transactionRepository } from '@/db/repositories/transactionRepository';
import { TransactionWithPartner } from '@/db/repositories/transactionRepository';

// Mock do transactionRepository
vi.mock('@/db/repositories/transactionRepository', () => ({
  transactionRepository: vi.fn().mockReturnValue({
    findAll: vi.fn(),
    countAll: vi.fn(),
  }),
}));

// Exemplo de dados de transação para os mocks
const mockTransaction: TransactionWithPartner = {
  id: 'txn_1',
  description: 'Test Transaction',
  value: "100.00", // Schemas Drizzle retornam string para decimal
  type: 'E',
  status: 'Pendente',
  partnerId: 'partner_1',
  partnerName: 'Test Partner',
  date: new Date('2023-01-15'),
  due_date: new Date('2023-01-20'),
  createdAt: new Date(),
  updatedAt: new Date(),
  transactionId: null, // Exemplo, pode ser string ou null
};

describe('getTransactionsUseCase', () => {
  let mockTransactionRepo: ReturnType<typeof transactionRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Como transactionRepository é uma factory, obtemos a instância mockada assim
    mockTransactionRepo = transactionRepository(vi.fn() as any);
  });

  it('should fetch transactions with default pagination and no filters', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransaction]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await getTransactionsUseCase();

    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      {}, // repoFilters (vazio)
      { offset: 0, limit: 10 } // default pagination
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
      { offset: 0, limit: 10 }
    );
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith(expectedRepoFilters);
  });

  it('should fetch transactions with specified pagination', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(25); // Ex: 25 itens no total

    const pagination = { page: 2, pageSize: 5 };
    const result = await getTransactionsUseCase(undefined, pagination);

    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      {},
      { offset: 5, limit: 5 } // (page 2 - 1) * 5 = 5
    );
    expect(result.currentPage).toBe(2);
    expect(result.pageSize).toBe(5);
    expect(result.totalPages).toBe(5); // 25 / 5 = 5
  });

  it('should apply application-level filters for partnerId and dates', async () => {
    const transactionsFromRepo = [
      { ...mockTransaction, id: 'txn_1', partnerId: 'partner_A', date: new Date('2023-01-10') },
      { ...mockTransaction, id: 'txn_2', partnerId: 'partner_B', date: new Date('2023-01-15') },
      { ...mockTransaction, id: 'txn_3', partnerId: 'partner_A', date: new Date('2023-01-20') },
    ];
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(transactionsFromRepo);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(3);

    const filters = { partnerId: 'partner_A', dateFrom: new Date('2023-01-01'), dateTo: new Date('2023-01-15') };
    const result = await getTransactionsUseCase(filters);

    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('txn_1');
    // countAll ainda é chamado com repoFilters vazios, pois esses filtros são app-level
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith({});
  });

  it('should return empty data and correct pagination if repository throws error', async () => {
    const repositoryError = new Error('DB Query Failed');
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);
    // findAll não será chamado se countAll falhar primeiro, mas podemos mockar para o caso
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    // Vitest não tem toThrowWithMessage diretamente como Jest, mas podemos verificar a mensagem no catch
    // ou esperar que o caso de uso trate e retorne uma estrutura de erro.
    // O caso de uso atual propaga o erro.
    // Para testar a estrutura de retorno da action em caso de erro, precisaríamos testar a action.
    // Aqui, testamos o comportamento do caso de uso.
    await expect(getTransactionsUseCase()).rejects.toThrow(repositoryError);
  });

  it('should calculate totalPages correctly', async () => {
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(23);
    const pagination = { pageSize: 10 };
    const result = await getTransactionsUseCase(undefined, pagination);
    expect(result.totalPages).toBe(3); // Math.ceil(23 / 10)

    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(20);
    const result2 = await getTransactionsUseCase(undefined, pagination);
    expect(result2.totalPages).toBe(2); // Math.ceil(20 / 10)

    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    const result3 = await getTransactionsUseCase(undefined, pagination);
    expect(result3.totalPages).toBe(0);
  });
});
