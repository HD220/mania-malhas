import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProduct, UpdateProductServerResponse } from './actions'; // getProductWithImagesById não será testada aqui
import alterProductUseCase from '@/usecases/product/alterProductUseCase';
import { InsertProductWithImages } from '@/db/repositories/schemas/productImageSchema';
import { ZodError } from 'zod';
import { revalidatePath } from 'next/cache'; // Importar diretamente

// Mock do alterProductUseCase
vi.mock('@/usecases/product/alterProductUseCase');

// Mock de next/cache
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    revalidatePath: vi.fn(),
  };
});
// next/navigation não é usado, então o mock pode ser removido se não houver outros usos planejados

describe('updateProduct Server Action', () => {
  const mockAlterProductUseCase = alterProductUseCase as ReturnType<typeof vi.fn>;
  const productId = 'test-product-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validProductData: InsertProductWithImages = {
    name: 'Updated Action Product',
    price: 200,
    active: true,
    images: [{ name: 'img_updated.jpg', url: 'http://example.com/img_updated.jpg', active: true }],
  };

  it('should return success true and product data on successful update', async () => {
    mockAlterProductUseCase.mockResolvedValue(undefined); // alterProductUseCase não retorna valor

    const response: UpdateProductServerResponse = await updateProduct({ id: productId, ...validProductData });

    expect(mockAlterProductUseCase).toHaveBeenCalledWith(productId, validProductData);
    expect(response.success).toBe(true);
    expect(response.message).toBe('Produto atualizado com sucesso!');
    expect(response.product).toEqual({ id: productId, ...validProductData });
    expect(response.errors).toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith('/product/list'); // Usar importado
    expect(revalidatePath).toHaveBeenCalledWith(`/product/${productId}/edit`); // Usar importado
  });

  it('should return success false if ID is not provided', async () => {
    // @ts-expect-error Testando o caso de ID ausente, quebrando a tipagem de propósito
    const response: UpdateProductServerResponse = await updateProduct({ ...validProductData, id: undefined });
    expect(response.success).toBe(false);
    expect(response.message).toBe('ID do produto não fornecido.');
    expect(mockAlterProductUseCase).not.toHaveBeenCalled();
  });

  it('should return success false and Zod errors if use case throws ZodError', async () => {
    // Este teste simula o ZodError sendo lançado pelo alterProductUseCase
    const fieldErrors = { price: ['Preço deve ser positivo'] };
    const mockZodError = new ZodError([{
        path: ['price'],
        message: 'Preço deve ser positivo',
        code: 'custom'
    }]);
    mockAlterProductUseCase.mockRejectedValue(mockZodError);

    const response: UpdateProductServerResponse = await updateProduct({ id: productId, ...validProductData, price: -10 });

    expect(response.success).toBe(false);
    expect(response.errors).toEqual(expect.objectContaining({ price: expect.any(Array) }));
    // A mensagem pode vir do ZodError ou ser a genérica da action
    expect(response.message).toContain("Erro de validação");
  });

  it('should return success false and a generic message if use case throws a non-Zod error', async () => {
    const errorMessage = 'Database update failed';
    mockAlterProductUseCase.mockRejectedValue(new Error(errorMessage));

    const response: UpdateProductServerResponse = await updateProduct({ id: productId, ...validProductData });

    expect(response.success).toBe(false);
    expect(response.message).toBe('Erro ao atualizar produto. Tente novamente.');
    expect(response.errors).toBeUndefined();
  });
});
