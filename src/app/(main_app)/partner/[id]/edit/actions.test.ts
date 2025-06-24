import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePartner, UpdatePartnerServerResponse } from './actions';
import alterPartnerUseCase from '@/usecases/partner/alterPartnerUseCase';
import { InsertPartner } from '@/features/partner/schemas/partnerSchema';
import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache'; // Importar diretamente

vi.mock('@/usecases/partner/alterPartnerUseCase');
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});

describe('updatePartner Server Action', () => {
  const mockAlterPartnerUseCase = alterPartnerUseCase as ReturnType<typeof vi.fn>;
  const partnerId = 'test-partner-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPartnerData: InsertPartner = {
    name: 'Updated Action Partner',
    phone: '0987654321',
    active: false,
  };

  it('should return success true and partner data on successful update', async () => {
    mockAlterPartnerUseCase.mockResolvedValue(undefined);

    const response: UpdatePartnerServerResponse = await updatePartner({ id: partnerId, ...validPartnerData });

    expect(mockAlterPartnerUseCase).toHaveBeenCalledWith(partnerId, validPartnerData);
    expect(response.success).toBe(true);
    expect(response.message).toBe('Parceiro atualizado com sucesso!');
    expect(response.partner).toEqual({ id: partnerId, ...validPartnerData });
    expect(response.errors).toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith('/partner/list'); // Usar importado
    expect(revalidatePath).toHaveBeenCalledWith(`/partner/${partnerId}/edit`); // Usar importado
  });

  it('should return success false if ID is not provided', async () => {
    // @ts-expect-error Testando ID ausente
    const response: UpdatePartnerServerResponse = await updatePartner({ ...validPartnerData, id: undefined });
    expect(response.success).toBe(false);
    expect(response.message).toBe('ID do parceiro não fornecido.');
    expect(mockAlterPartnerUseCase).not.toHaveBeenCalled();
  });

  it('should return success false and Zod errors if use case throws ZodError', async () => {
    const fieldErrors = { phone: ['Telefone inválido'] };
    const mockZodError = new ZodError([{ path: ['phone'], message: 'Telefone inválido', code: 'custom' }]);
    mockAlterPartnerUseCase.mockRejectedValue(mockZodError);

    const response: UpdatePartnerServerResponse = await updatePartner({ id: partnerId, ...validPartnerData, phone: "123" });

    expect(response.success).toBe(false);
    expect(response.errors).toEqual(expect.objectContaining({ phone: expect.any(Array) }));
    expect(response.message).toContain("Erro de validação");
  });

  it('should return success false and a generic message if use case throws a non-Zod error', async () => {
    const errorMessage = 'Database update failed';
    mockAlterPartnerUseCase.mockRejectedValue(new Error(errorMessage));

    const response: UpdatePartnerServerResponse = await updatePartner({ id: partnerId, ...validPartnerData });

    expect(response.success).toBe(false);
    expect(response.message).toBe('Erro ao atualizar parceiro. Tente novamente.');
    expect(response.errors).toBeUndefined();
  });
});
