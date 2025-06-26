import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct, CreateProductServerResponse } from './new-product.action'; // Updated
import createProductUseCase from '@/features/product/usecases/create-product.usecase'; // Updated
import { InsertProductWithImages } from '@/features/product/schemas/product-image.schema'; // Updated
import { ZodError } from 'zod';

import { revalidatePath } from 'next/cache';

// Mock do createProductUseCase
vi.mock('@/features/product/usecases/create-product.usecase'); // Updated

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
    expect(revalidatePath).toHaveBeenCalledWith('/product/list');
  });

  it('should return success false and Zod errors if use case throws ZodError', async () => {
    const fieldErrors = { name: ['Nome é obrigatório'] };
    const mockZodError = new ZodError([{
      path: ['name'],
      message: 'Nome é obrigatório',
      code: 'custom'
    }]);

    const invalidData = { ...validProductData, name: '' } as InsertProductWithImages;

    const response: CreateProductServerResponse = await createProduct(invalidData);

    expect(response.success).toBe(false);
    expect(response.errors).toEqual(expect.objectContaining({ name: expect.any(Array) }));
    expect(response.message).toBe("Erro de validação nos dados fornecidos.");
    expect(mockCreateProductUseCase).not.toHaveBeenCalled();
  });

  it('should return success false and a generic message if use case throws a non-Zod error', async () => {
    const errorMessage = 'Database connection error';
    mockCreateProductUseCase.mockRejectedValue(new Error(errorMessage));

    const response: CreateProductServerResponse = await createProduct(validProductData);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Erro ao criar produto. Tente novamente.');
    expect(response.errors).toBeUndefined();
  });

   it('should return success false and custom message if use case throws specific non-Zod error', async () => {
    const specificErrorMessage = 'Erro específico do UseCase';
    mockCreateProductUseCase.mockRejectedValue(new Error(specificErrorMessage));

    const response: CreateProductServerResponse = await createProduct(validProductData);

    expect(response.success).toBe(false);
    expect(response.message).toBe('Erro ao criar produto. Tente novamente.');
    expect(response.errors).toBeUndefined();
  });
});
