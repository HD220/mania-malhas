import { describe, it, expect, vi, beforeEach } from 'vitest';
import createTransactionUseCase, { CreateTransactionInput } from './createTransactionUseCase';
import { transactionRepository } from '@/db/repositories/transactionRepository';
import { insertTransactionSchema, SelectTransaction } from '@/db/repositories/schemas/transactionSchema';
import { ZodError } from 'zod';
import { faker } from '@faker-js/faker';

// Mock do transactionRepository factory
vi.mock('@/db/repositories/transactionRepository', () => ({
  transactionRepository: vi.fn().mockReturnValue({
    insert: vi.fn(),
    findById: vi.fn(),
  }),
}));

describe('createTransactionUseCase', () => {
  let mockRepo: ReturnType<ReturnType<typeof transactionRepository>>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Como transactionRepository é uma factory, obtemos a instância mockada assim
    // e podemos reatribuir para mockRepo para ter o tipo correto.
    const factory = transactionRepository as vi.MockedFunction<typeof transactionRepository>;
    mockRepo = {
      insert: vi.fn(),
      findById: vi.fn(),
      // Adicione outros métodos se forem usados ou para completar o tipo
      findAll: vi.fn(),
      countAll: vi.fn(),
      update: vi.fn(),
    };
    factory.mockReturnValue(mockRepo);
  });

  const validTransactionData: CreateTransactionInput = {
    description: 'Nova Transação de Teste',
    value: "123.45",
    type: 'E',
    status: 'Pendente',
    partnerId: faker.string.uuid(),
    date: new Date(),
    due_date: faker.date.future(),
    // transactionId (para pagamentos) é opcional e não parte do input direto de criação de transação
  };

  const createdTransactionId = faker.string.uuid();
  const mockCreatedTransaction: SelectTransaction = {
    ...validTransactionData,
    id: createdTransactionId,
    value: "123.45", // Zod schema para select pode ter transformado ou validado
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionId: null, // Exemplo
  };

  it('should create a transaction successfully and return the created transaction', async () => {
    mockRepo.insert.mockResolvedValue({ id: createdTransactionId });
    mockRepo.findById.mockResolvedValue(mockCreatedTransaction);

    const result = await createTransactionUseCase(validTransactionData);

    const expectedParsedData = insertTransactionSchema.parse(validTransactionData); // Zod fará a coerção de Date

    expect(mockRepo.insert).toHaveBeenCalledTimes(1);
    // Comparar os dados passados para insert após o parse do Zod
    // Zod pode transformar datas em objetos Date, então é importante comparar com o resultado do parse.
    expect(mockRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ...expectedParsedData,
        // As datas no objeto Date podem ter problemas de comparação direta devido a milissegundos ou timezone.
        // É mais seguro verificar se são instâncias de Date se a precisão exata não for crítica para este mock.
        date: expect.any(Date),
        due_date: expect.any(Date),
      })
    );

    expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    expect(mockRepo.findById).toHaveBeenCalledWith(createdTransactionId);
    expect(result).toEqual(mockCreatedTransaction);
  });

  it('should throw ZodError if input data is invalid', async () => {
    const invalidData = { ...validTransactionData, value: "not-a-number" } as any;

    await expect(createTransactionUseCase(invalidData)).rejects.toThrow(ZodError);
    expect(mockRepo.insert).not.toHaveBeenCalled();
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.insert fails', async () => {
    const dbError = new Error('Database insert failed');
    mockRepo.insert.mockRejectedValue(dbError);

    await expect(createTransactionUseCase(validTransactionData)).rejects.toThrow(dbError);
    expect(mockRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.findById fails after successful insert', async () => {
    mockRepo.insert.mockResolvedValue({ id: createdTransactionId });
    const findError = new Error('Database findById failed');
    mockRepo.findById.mockRejectedValue(findError);

    await expect(createTransactionUseCase(validTransactionData)).rejects.toThrow(findError);
  });

  it('should throw an error if repository.findById returns null after successful insert', async () => {
    mockRepo.insert.mockResolvedValue({ id: createdTransactionId });
    mockRepo.findById.mockResolvedValue(null); // Simula não encontrar a transação

    await expect(createTransactionUseCase(validTransactionData)).rejects.toThrow(
      "Failed to retrieve the created transaction after insertion."
    );
  });
});
