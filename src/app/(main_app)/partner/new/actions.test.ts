import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InsertPartner } from '@/features/partner/types/partner.schema';
import createPartnerUseCase from '@/features/partner/usecases/create-partner.usecase';

import { createPartner, CreatePartnerServerResponse } from './actions';


vi.mock('@/features/partner/usecases/create-partner.usecase');
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});
// redirect não é usado, mock pode ser removido ou mantido se houver planos
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    redirect: vi.fn(),
  };
});


describe('createPartner Server Action', () => {
  const mockCreatePartnerUseCase = createPartnerUseCase as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPartnerData: InsertPartner = {
    name: 'Test Action Partner',
    phone: '1234567890', // 10 digits
    active: true,
  };

  it('should return success true and partner data on successful creation', async () => {
    const createdPartner = { ...validPartnerData, id: 'new-partner-id' };
    mockCreatePartnerUseCase.mockResolvedValue(createdPartner);

    const response: CreatePartnerServerResponse = await createPartner(validPartnerData);

    expect(mockCreatePartnerUseCase).toHaveBeenCalledWith(validPartnerData);
    expect(response.success).toBe(true);
    expect(response.message).toBe('Parceiro criado com sucesso!');
    expect(response.partner).toEqual(createdPartner);
    expect(response.errors).toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith('/partner/list'); // Usar importado
  });

  it('should return success false and Zod errors if use case throws ZodError', async () => {
    const fieldErrors = { name: ['Nome é obrigatório'] };
    const mockZodError = new ZodError([{ path: ['name'], message: 'Nome é obrigatório', code: 'custom' }]);
    mockCreatePartnerUseCase.mockRejectedValue(mockZodError); // Simular erro vindo do use case

    const response: CreatePartnerServerResponse = await createPartner(validPartnerData); // Usar dados válidos, pois o erro vem do use case

    expect(response.success).toBe(false);
    expect(response.errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
    expect(response.message).toContain('Erro de validação');
  });

  it('should return success false and a generic message if use case throws a non-Zod error', async () => {
    const errorMessage = 'Database connection error';
    mockCreatePartnerUseCase.mockRejectedValue(new Error(errorMessage));

    const response: CreatePartnerServerResponse = await createPartner(validPartnerData);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Erro ao criar parceiro. Tente novamente.');
    expect(response.errors).toBeUndefined();
  });
});
