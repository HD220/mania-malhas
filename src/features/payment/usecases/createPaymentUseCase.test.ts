import { describe, it, expect, vi, beforeEach } from 'vitest';
import createPaymentUseCase from './createPaymentUseCase';
import { db } from '@/lib/db-config/postgres';
import { paymentRepository } from '@/features/payment/db/payment-repository';
import { InsertPayment, insertPaymentSchema } from '@/features/payment/schemas/paymentSchema';
import { transactionTable } from '@/db/postgres/schema/transaction';
import { ZodError } from 'zod';

// Mock do paymentRepository
vi.mock('@/features/payment/db/payment-repository', () => ({
  paymentRepository: vi.fn().mockReturnValue({
    insert: vi.fn(),
    findByTransactionId: vi.fn(),
  }),
}));

// Mock do 'db' para a consulta direta à transactionTable
vi.mock('@/lib/db-config/postgres', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    // Adicione .execute() se sua cadeia de query real o usar, ou mockResolvedValue diretamente no where/from
  },
}));


import { faker } from '@faker-js/faker'; // Import faker

describe('createPaymentUseCase', () => {
  let mockPaymentRepo: ReturnType<typeof paymentRepository>;
  const mockDbSelect = db.select as ReturnType<typeof vi.fn>;
  let validTransactionId: string; // Será um UUID mockado

  beforeEach(() => {
    vi.clearAllMocks();
    mockPaymentRepo = paymentRepository(vi.fn() as any);
    validTransactionId = faker.string.uuid(); // Gerar novo UUID para cada teste se necessário, ou um fixo

    // Reset db mock fluent interface for each test if needed
    mockDbSelect.mockClear().mockReturnThis();
    (db.from as ReturnType<typeof vi.fn>).mockClear().mockReturnThis();
    (db.where as ReturnType<typeof vi.fn>).mockClear();
  });

  const mockTransactionDetails = { totalValue: "100.00", type: 'S' };

  it('should create a payment successfully with valid data', async () => {
    const validInput: InsertPayment = {
      transactionId: validTransactionId,
      value: 50.00, // value é number no InsertPayment (após coerce no schema)
      date: new Date(),
    };
    // O schema vai converter value para number, então o input para o use case deve ser number
    const parsedInput = insertPaymentSchema.parse(validInput);

    (db.where as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransactionDetails]);
    (mockPaymentRepo.findByTransactionId as ReturnType<typeof vi.fn>).mockResolvedValue([]); // No existing payments
    (mockPaymentRepo.insert as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'new-payment-id' });

    const result = await createPaymentUseCase(parsedInput);

    expect(mockDbSelect).toHaveBeenCalledWith({ totalValue: transactionTable.value, type: transactionTable.type });
    expect(db.from).toHaveBeenCalledWith(transactionTable);
    // expect(db.where).toHaveBeenCalledWith(expect.anything()); // eq(transactionTable.id, validTransactionId)

    expect(mockPaymentRepo.findByTransactionId).toHaveBeenCalledWith(validTransactionId);
    expect(mockPaymentRepo.insert).toHaveBeenCalledWith(parsedInput);
    expect(result).toEqual({ id: 'new-payment-id' });
  });

  it('should throw ZodError for invalid payment data (e.g., negative value)', async () => {
    const invalidInput = {
      transactionId: validTransactionId,
      value: -10, // Invalid value
    } as InsertPayment;

    try {
      await createPaymentUseCase(invalidInput);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('value'))).toBe(true);
      }
    }
  });

  it('should throw Error if transaction is not found', async () => {
    // Usar um UUID válido aqui, mesmo que não exista no "banco" mockado
    const inputForNotFound: InsertPayment = { transactionId: faker.string.uuid(), value: 50.00 };
    const parsedInput = insertPaymentSchema.parse(inputForNotFound); // Parse para garantir que o UUID é válido para o schema

    (db.where as ReturnType<typeof vi.fn>).mockResolvedValue([]); // Simula transação não encontrada

    await expect(createPaymentUseCase(parsedInput)).rejects.toThrow("Transação não encontrada.");
  });

  it('should throw Error if payment value exceeds remaining balance', async () => {
    const validInput: InsertPayment = { transactionId: validTransactionId, value: 150.00 };
    const parsedInput = insertPaymentSchema.parse(validInput);

    (db.where as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransactionDetails]); // totalValue = 100.00
    (mockPaymentRepo.findByTransactionId as ReturnType<typeof vi.fn>).mockResolvedValue([{ value: "20.00" }]); // 20 já pago

    // Tenta pagar 150, mas só faltam 80.
    await expect(createPaymentUseCase(parsedInput)).rejects.toThrow(/excede o saldo devedor/);
  });

  it('should allow full payment if remaining balance matches', async () => {
    const validInput: InsertPayment = { transactionId: validTransactionId, value: 80.00 };
    const parsedInput = insertPaymentSchema.parse(validInput);

    (db.where as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransactionDetails]); // totalValue = 100.00
    (mockPaymentRepo.findByTransactionId as ReturnType<typeof vi.fn>).mockResolvedValue([{ value: "20.00" }]); // 20 já pago
    (mockPaymentRepo.insert as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'payment-id-full' });

    const result = await createPaymentUseCase(parsedInput);
    expect(result).toEqual({ id: 'payment-id-full' });
    expect(mockPaymentRepo.insert).toHaveBeenCalledWith(parsedInput);
  });


  it('should throw an error if payment repository fails to insert', async () => {
    const validInput: InsertPayment = { transactionId: validTransactionId, value: 50.00 };
    const parsedInput = insertPaymentSchema.parse(validInput);

    (db.where as ReturnType<typeof vi.fn>).mockResolvedValue([mockTransactionDetails]);
    (mockPaymentRepo.findByTransactionId as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const repoError = new Error('DB insert failed');
    (mockPaymentRepo.insert as ReturnType<typeof vi.fn>).mockRejectedValue(repoError);

    await expect(createPaymentUseCase(parsedInput)).rejects.toThrow(repoError);
  });
});
