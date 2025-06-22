import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPaymentAction, PaymentServerResponse } from './actions'; // listPaymentsByTransactionAction não será testada aqui
import createPaymentUseCase from '@/usecases/payment/createPaymentUseCase';
import { InsertPayment } from '@/db/repositories/schemas/paymentSchema';
import { ZodError } from 'zod';
import { faker } from '@faker-js/faker';

// Mock do createPaymentUseCase
vi.mock('@/usecases/payment/createPaymentUseCase');

// Mock de revalidatePath (se usado, embora esteja comentado na action)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('addPaymentAction Server Action', () => {
  const mockCreatePaymentUseCase = createPaymentUseCase as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPaymentData: InsertPayment = {
    transactionId: faker.string.uuid(),
    value: 100.50,
    date: new Date(),
  };

  it('should return success true and payment ID on successful payment creation', async () => {
    const newPaymentId = faker.string.uuid();
    mockCreatePaymentUseCase.mockResolvedValue({ id: newPaymentId });

    const response: PaymentServerResponse<{ id: string }> = await addPaymentAction(validPaymentData);

    expect(mockCreatePaymentUseCase).toHaveBeenCalledWith(validPaymentData);
    expect(response.success).toBe(true);
    expect(response.message).toBe('Pagamento adicionado com sucesso!');
    expect(response.data).toEqual({ id: newPaymentId });
    expect(response.errors).toBeUndefined();
    // Verificar revalidatePath se for descomentado na action
    // expect(require('next/cache').revalidatePath).toHaveBeenCalledWith('/transactions/list');
  });

  it('should return success false and Zod errors if use case throws ZodError', async () => {
    const fieldErrors = { value: ['Valor deve ser positivo'] };
    const mockZodError = new ZodError([{ path: ['value'], message: 'Valor deve ser positivo', code: 'custom' }]);
    mockCreatePaymentUseCase.mockRejectedValue(mockZodError);

    const response: PaymentServerResponse<{ id: string }> = await addPaymentAction(validPaymentData);

    expect(response.success).toBe(false);
    expect(response.errors).toEqual(expect.objectContaining({ value: expect.any(Array) }));
    expect(response.message).toContain("Erro de validação nos dados do pagamento.");
  });

  it('should return success false and specific message if use case throws a known domain error', async () => {
    const errorMessage = 'Transação não encontrada.';
    mockCreatePaymentUseCase.mockRejectedValue(new Error(errorMessage));

    const response: PaymentServerResponse<{ id: string }> = await addPaymentAction(validPaymentData);

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage); // A action propaga a mensagem de erro do use case
    expect(response.errors).toBeUndefined();
  });

  it('should return success false and a generic message if use case throws an unexpected non-Zod error', async () => {
    const errorMessage = 'Database connection error';
    mockCreatePaymentUseCase.mockRejectedValue(new Error(errorMessage)); // Um erro genérico

    const response: PaymentServerResponse<{ id: string }> = await addPaymentAction(validPaymentData);

    expect(response.success).toBe(false);
    // A action propaga a mensagem do erro, mesmo que genérico
    expect(response.message).toBe(errorMessage);
    expect(response.errors).toBeUndefined();
  });
});
