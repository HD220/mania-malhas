import { describe, it, expect, vi, beforeEach } from 'vitest';
import createProductUseCase from './createProductUseCase'; // Caminho para o seu use case
import { productRepository } from '@/features/product/db/productRepository'; // Adjusted
import { InsertProductWithImages, insertProductWithImagesSchema } from '@/features/product/schemas/productImageSchema'; // Adjusted
import { ZodError } from 'zod';

// Mock do repositório de produtos
vi.mock('@/features/product/db/productRepository', () => ({ // Adjusted
  productRepository: vi.fn().mockReturnValue({
    insert: vi.fn(),
    // Adicione outros métodos mockados se createProductUseCase os utilizar indiretamente
  }),
}));

// Mock do banco de dados (db) - pode não ser necessário se o productRepository estiver totalmente mockado
// vi.mock('@/db/postgres', () => ({
//   db: {}, // Mock vazio ou com funcionalidades específicas se necessário
// }));

describe('createProductUseCase', () => {
  let mockProductRepo: ReturnType<typeof productRepository>;

  beforeEach(() => {
    // Resetar mocks antes de cada teste
    vi.clearAllMocks();
    // Obter uma nova instância do mock do repositório para cada teste, se necessário,
    // ou reconfigurar o mock global.
    // Neste caso, como productRepository é uma factory, e é mockada uma vez,
    // podemos acessar seus métodos mockados diretamente.
    mockProductRepo = productRepository(vi.fn() as any); // Passa um mock de db para a factory
  });

  it('should create a product successfully with valid data', async () => {
    const validInput: InsertProductWithImages = {
      name: 'Test Product',
      price: 100,
      active: true,
      images: [{ name: 'image1.jpg', url: 'http://example.com/image1.jpg', active: true }],
      // Adicione outros campos obrigatórios conforme o schema
    };

    const mockRepoResponse = { id: 'new-product-id' };
    (mockProductRepo.insert as ReturnType<typeof vi.fn>).mockResolvedValue(mockRepoResponse);

    const result = await createProductUseCase(validInput);

    // productRepository (a factory) é chamada uma vez no beforeEach e uma vez dentro do use case.
    // Se quisermos testar apenas a chamada de dentro do use case, precisaríamos de um setup diferente.
    // Por agora, vamos focar no mock do método 'insert'.
    // expect(productRepository).toHaveBeenCalledTimes(1); // Removido ou ajustado
    expect(mockProductRepo.insert).toHaveBeenCalledTimes(1); // Garantir que o insert foi chamado uma vez
    expect(mockProductRepo.insert).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(mockRepoResponse);
  });

  it('should throw ZodError for invalid data', async () => {
    const invalidInput = { // Faltando campos obrigatórios como 'name' e 'price'
      active: true,
    } as InsertProductWithImages; // Type assertion para simular entrada inválida

    try {
      await createProductUseCase(invalidInput);
      // Se chegar aqui, o teste falhou pois o erro não foi lançado
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        // Verificar erros específicos dos campos se desejar
        expect(error.errors.some(e => e.path.includes('name'))).toBe(true);
        expect(error.errors.some(e => e.path.includes('price'))).toBe(true);
      }
    }
    expect(mockProductRepo.insert).not.toHaveBeenCalled();
  });

  it('should throw ZodError for invalid image URL', async () => {
    const invalidInput: InsertProductWithImages = {
      name: 'Test Product',
      price: 100,
      active: true,
      images: [{ name: 'image1.jpg', url: 'not-a-url', active: true }],
    };

    try {
      await createProductUseCase(invalidInput);
      expect(true).toBe(false); // Fail test if no error thrown
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('images') && e.path.includes('url'))).toBe(true);
      }
    }
    expect(mockProductRepo.insert).not.toHaveBeenCalled();
  });


  it('should throw an error if repository fails to insert', async () => {
    const validInput: InsertProductWithImages = {
      name: 'Test Product',
      price: 100,
      active: true,
      images: [],
    };

    const repositoryError = new Error('Database connection failed');
    (mockProductRepo.insert as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    try {
      await createProductUseCase(validInput);
      expect(true).toBe(false); // Fail test if no error thrown
    } catch (error) {
      expect(error).toBe(repositoryError);
    }
    expect(mockProductRepo.insert).toHaveBeenCalledWith(validInput);
  });

  it('should create a product successfully without images', async () => {
    const validInput: InsertProductWithImages = {
      name: 'Product No Image',
      price: 50,
      active: true,
      images: [], // Sem imagens
    };

    const mockRepoResponse = { id: 'no-image-product-id' };
    (mockProductRepo.insert as ReturnType<typeof vi.fn>).mockResolvedValue(mockRepoResponse);

    const result = await createProductUseCase(validInput);

    expect(mockProductRepo.insert).toHaveBeenCalledWith(validInput);
    expect(result).toEqual(mockRepoResponse);
  });

  it('should create a product successfully with null/undefined description (if schema allows)', async () => {
    const validInput: InsertProductWithImages = {
      name: 'Product With Null Desc',
      price: 60,
      active: true,
      description: null, // ou undefined, dependendo do schema
      images: [],
    };

    // Validação para garantir que o schema permite description nullish
    const parsedBySchema = insertProductWithImagesSchema.parse(validInput);

    const mockRepoResponse = { id: 'null-desc-product-id' };
    (mockProductRepo.insert as ReturnType<typeof vi.fn>).mockResolvedValue(mockRepoResponse);

    const result = await createProductUseCase(parsedBySchema); // Usar dados parseados pelo schema

    expect(mockProductRepo.insert).toHaveBeenCalledWith(parsedBySchema);
    expect(result).toEqual(mockRepoResponse);
  });

});
