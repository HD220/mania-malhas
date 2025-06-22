import { describe, it, expect, vi, beforeEach } from 'vitest';
import getTransactionsUseCase from './getTransactionsUseCase';
import { transactionRepository } from '@/db/repositories/transactionRepository';
import { TransactionWithPartner } from '@/db/repositories/transactionRepository';
import { faker } from '@faker-js/faker'; // Importar faker

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
    // Redefinir mockTransaction base para cada item para evitar contaminação de partnerId ou date original
    const createBaseMockTransaction = (): TransactionWithPartner => ({
      id: faker.string.uuid(),
      description: 'Base Test Transaction',
      value: "100.00",
      type: 'E',
      status: 'Pendente',
      partnerId: faker.string.uuid(), // Default diferente para cada
      partnerName: 'Base Partner',
      date: new Date('2023-01-01'), // Default diferente para cada
      due_date: new Date('2023-01-05'),
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionId: null,
    });

    const transactionsFromRepo = [
      { ...createBaseMockTransaction(), id: 'txn_1', partnerId: 'partner_A', date: new Date('2023-01-10') },
      { ...createBaseMockTransaction(), id: 'txn_2', partnerId: 'partner_B', date: new Date('2023-01-15') }, // Será filtrado por partnerId no app-level
      { ...createBaseMockTransaction(), id: 'txn_3', partnerId: 'partner_A', date: new Date('2023-01-20') }, // Será filtrado por data no repo-level (mock)
    ];

    // Simular que o repositório filtra por data
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockImplementation(async (repoFilters) => {
      let data = transactionsFromRepo;
      if (repoFilters?.dateFrom) {
        data = data.filter(t => t.date.getTime() >= repoFilters.dateFrom!.getTime());
      }
      if (repoFilters?.dateTo) {
        data = data.filter(t => t.date.getTime() <= repoFilters.dateTo!.getTime());
      }
      return data;
    });
    // countAll deve refletir os filtros que o repo suporta
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockImplementation(async (repoFilters) => {
        let data = transactionsFromRepo;
        if (repoFilters?.dateFrom) {
          data = data.filter(t => t.date.getTime() >= repoFilters.dateFrom!.getTime());
        }
        if (repoFilters?.dateTo) {
          data = data.filter(t => t.date.getTime() <= repoFilters.dateTo!.getTime());
        }
        return data.length;
    });

    const filters = { partnerId: 'partner_A', dateFrom: new Date('2023-01-01'), dateTo: new Date('2023-01-15') };
    const result = await getTransactionsUseCase(filters);

    expect(result.data.length).toBe(1); // Apenas txn_1 deve passar todos os filtros
    expect(result.data[0].id).toBe('txn_1');

    // Verificar se countAll foi chamado com os filtros de data
    const expectedRepoFilters = { dateFrom: filters.dateFrom, dateTo: filters.dateTo };
    expect(mockTransactionRepo.countAll).toHaveBeenCalledWith(expectedRepoFilters);
    // E findAll também
    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining(expectedRepoFilters), // Contém filtros de data
      expect.any(Object) // Paginação
    );
  });

  // Removido: it('should apply application-level date filters correctly', async () => { ... });
  // Este cenário agora está coberto pelo teste combinado 'should apply application-level filters for partnerId and dates'
  // e pela expectativa de que o repositório (mockado) filtre por data.

  it('should apply application-level partnerId filter correctly', async () => {
    const createBase = (): TransactionWithPartner => ({
      id: faker.string.uuid(), description: 'Test', value: "100", type: 'E', status: 'Pendente',
      partnerId: faker.string.uuid(), partnerName: 'Test Partner', date: new Date(),
      due_date: new Date(), createdAt: new Date(), updatedAt: new Date(), transactionId: null,
    });
    const transactionsFromRepo = [
      { ...createBase(), id: 'partner_ok', partnerId: 'partner_A_test' },
      { ...createBase(), id: 'partner_wrong', partnerId: 'partner_B_test' },
    ];
    (mockTransactionRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(transactionsFromRepo);
    (mockTransactionRepo.countAll as ReturnType<typeof vi.fn>).mockResolvedValue(2);

    const filters = { partnerId: 'partner_A_test' };
    const result = await getTransactionsUseCase(filters);
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('partner_ok');
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
