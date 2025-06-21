import { describe, it, expect, vi, beforeEach } from 'vitest';
import alterProductUseCase from './alterProductUseCase';
import { productRepository } from '@/db/repositories/productRepository';
import { InsertProductWithImages, insertProductWithImagesSchema } from '@/db/repositories/schemas/productImageSchema';
import { ZodError } from 'zod';

// Mock do repositório de produtos
vi.mock('@/db/repositories/productRepository', () => ({
  productRepository: vi.fn().mockReturnValue({
    update: vi.fn(),
    // Outros métodos não são diretamente chamados por alterProductUseCase
  }),
}));

describe('alterProductUseCase', () => {
  let mockProductRepo: ReturnType<typeof productRepository>;
  const productId = 'existing-product-id';

  beforeEach(() => {
    vi.clearAllMocks();
    mockProductRepo = productRepository(vi.fn() as any); // Passa um mock de db
  });

  it('should update a product successfully with valid data', async () => {
    const validInput: InsertProductWithImages = {
      name: 'Updated Test Product',
      price: 120,
      active: true,
      images: [{ name: 'image1_updated.jpg', url: 'http://example.com/image1_updated.jpg', active: true }],
    };

    // repo.update não retorna valor significativo, então mockResolvedValue(undefined) ou similar
    (mockProductRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await alterProductUseCase(productId, validInput);

    expect(mockProductRepo.update).toHaveBeenCalledTimes(1);
    expect(mockProductRepo.update).toHaveBeenCalledWith(productId, validInput);
  });

  it('should throw ZodError for invalid data (e.g., missing name)', async () => {
    const invalidInput = { // Faltando nome
      price: 120,
      active: true,
    } as InsertProductWithImages;

    try {
      await alterProductUseCase(productId, invalidInput);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('name'))).toBe(true);
      }
    }
    expect(mockProductRepo.update).not.toHaveBeenCalled();
  });

  it('should throw ZodError for invalid image URL', async () => {
    const invalidInput: InsertProductWithImages = {
      name: 'Updated Test Product',
      price: 120,
      active: true,
      images: [{ name: 'image1.jpg', url: 'not-a-valid-url', active: true }],
    };

    try {
      await alterProductUseCase(productId, invalidInput);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('images') && e.path.includes('url'))).toBe(true);
      }
    }
    expect(mockProductRepo.update).not.toHaveBeenCalled();
  });

  it('should throw an error if repository fails to update', async () => {
    const validInput: InsertProductWithImages = {
      name: 'Test Product Update Fail',
      price: 100,
      active: true,
      images: [],
    };

    const repositoryError = new Error('Database update failed');
    (mockProductRepo.update as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    try {
      await alterProductUseCase(productId, validInput);
      expect.fail('Should have thrown repository error');
    } catch (error) {
      expect(error).toBe(repositoryError);
    }
    expect(mockProductRepo.update).toHaveBeenCalledWith(productId, validInput);
  });

  it('should correctly pass data even if images array is undefined (if schema allows)', async () => {
    // insertProductWithImagesSchema tem images como .array().optional()
    const validInput: InsertProductWithImages = {
      name: 'Product No Image Array',
      price: 70,
      active: true,
      // images: undefined, // omitindo o campo images
    };
     // Para garantir que o input é válido conforme o schema (Zod trata undefined para optional)
    const parsedInput = insertProductWithImagesSchema.parse(validInput);


    (mockProductRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await alterProductUseCase(productId, parsedInput);

    expect(mockProductRepo.update).toHaveBeenCalledTimes(1);
    // O Zod pode adicionar o campo 'images' como 'undefined' se ele for opcional.
    // Ou, se o schema não o definir como opcional mas o tipo sim, o parse pode falhar.
    // No nosso caso, `images` é `array().optional()`, então `parsedInput` não terá `images` se não for fornecido.
    // O `repo.update` receberá `validationResult.data` que pode ou não ter `images`.
    expect(mockProductRepo.update).toHaveBeenCalledWith(productId, parsedInput);
  });
});
