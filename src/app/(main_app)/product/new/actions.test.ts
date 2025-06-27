import { revalidatePath } from 'next/cache'; // Importar diretamente
import { ZodError } from 'zod';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InsertProductWithImages } from '@/features/product/schemas/productImageSchema';
import createProductUseCase from '@/features/product/usecases/create-product.usecase';

import { createProduct, CreateProductServerResponse } from './actions';


// Mock do createProductUseCase
vi.mock('@/features/product/usecases/create-product.usecase');

// Mock de next/cache e next/navigation
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});
vi.mock('next/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/navigation')>();
  return {
    ...actual,
    redirect: vi.fn(),
  };
});


describe('createProduct Server Action', () => {
  const mockCreateProductUseCase = createProductUseCase as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validProductData: InsertProductWithImages = {
    name: 'Test Action Product',
    price: 150,
    active: true,
    images: [{ name: 'img.jpg', url: 'http://example.com/img.jpg', active: true }],
  };

  it('should return success true and a message on successful product creation', async () => {
    mockCreateProductUseCase.mockResolvedValue({ id: 'new-prod-id' });

    const response: CreateProductServerResponse = await createProduct(validProductData);

    expect(mockCreateProductUseCase).toHaveBeenCalledWith(validProductData);
    expect(response.success).toBe(true);
    expect(response.message).toBe('Produto criado com sucesso!');
    expect(response.errors).toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith('/product/list'); // Usar o importado
  });

  it('should return success false and Zod errors if use case throws ZodError', async () => {
    // Simular ZodError vindo do schema parse dentro da action ou do use case
    const fieldErrors = { name: ['Nome é obrigatório'] };
    const mockZodError = new ZodError([{
      path: ['name'],
      message: 'Nome é obrigatório',
      code: 'custom' // Necessário para construir um ZodError válido
    }]);

    // Testar o caso onde o parse dentro da action falha
    // Para isso, o input para createProduct precisa ser inválido
    const invalidData = { ...validProductData, name: '' } as InsertProductWithImages;

    // Não precisamos mockar o useCase para este teste específico de ZodError na action
    // já que o parse da action é o primeiro a ser atingido.
    // Se quiséssemos testar o ZodError vindo do useCase, mockaríamos o useCase para lançar ZodError.

    const response: CreateProductServerResponse = await createProduct(invalidData);

    expect(response.success).toBe(false);
    expect(response.errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
    expect(response.message).toBe("Erro de validação nos dados fornecidos.");
    expect(mockCreateProductUseCase).not.toHaveBeenCalled(); // Não deve chamar o useCase
  });

  it('should return success false and a generic message if use case throws a non-Zod error', async () => {
    const errorMessage = 'Database connection error';
    mockCreateProductUseCase.mockRejectedValue(new Error(errorMessage));

    const response: CreateProductServerResponse = await createProduct(validProductData);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Erro ao criar produto. Tente novamente.'); // Mensagem genérica da action
    expect(response.errors).toBeUndefined();
  });

   it('should return success false and custom message if use case throws specific non-Zod error', async () => {
    // Este teste assume que a action pode, em algum momento, passar mensagens de erro específicas
    // do use case se elas forem consideradas seguras. Atualmente, a action usa uma mensagem genérica.
    const specificErrorMessage = 'Erro específico do UseCase';
    mockCreateProductUseCase.mockRejectedValue(new Error(specificErrorMessage));

    const response: CreateProductServerResponse = await createProduct(validProductData);

    expect(response.success).toBe(false);
    // Atualmente, a action retorna "Erro ao criar produto. Tente novamente."
    // Se quiséssemos que a mensagem do erro do use case fosse propagada, a action teria que ser mudada.
    // Por agora, testamos o comportamento atual.
    expect(response.message).toBe('Erro ao criar produto. Tente novamente.');
    expect(response.errors).toBeUndefined();
  });
});
