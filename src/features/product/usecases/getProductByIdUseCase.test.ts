import { describe, it, expect, vi, beforeEach } from 'vitest';
import getProductByIdUseCase from './getProductByIdUseCase';
import { productRepository } from '@/features/product/db/productRepository'; // Adjusted
import { SelectProductWithImages } from '@/features/product/schemas/productImageSchema'; // Adjusted
import { faker } from '@faker-js/faker';

// Mock do productRepository
vi.mock('@/features/product/db/productRepository', () => ({ // Adjusted
  productRepository: vi.fn().mockReturnValue({
    findById: vi.fn(),
  }),
}));

const mockProduct: SelectProductWithImages = {
  id: 'prod_123',
  name: 'Test Product',
  price: 199.99,
  active: true,
  description: 'A great test product.',
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('getProductByIdUseCase', () => {
  let mockProductRepo: ReturnType<typeof productRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProductRepo = productRepository(vi.fn() as any);
  });

  it('should return a product if found by ID', async () => {
    (mockProductRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProduct);
    const productId = 'prod_123';
    const result = await getProductByIdUseCase(productId);

    expect(mockProductRepo.findById).toHaveBeenCalledWith(productId);
    expect(result).toEqual(mockProduct);
  });

  it('should return null if product is not found by ID', async () => {
    (mockProductRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const productId = 'prod_not_found';
    const result = await getProductByIdUseCase(productId);

    expect(mockProductRepo.findById).toHaveBeenCalledWith(productId);
    expect(result).toBeNull();
  });

  it('should return null if ID is invalid (e.g., empty string)', async () => {
    // O caso de uso agora tem uma verificação para ID inválido
    const result = await getProductByIdUseCase('');
    expect(mockProductRepo.findById).not.toHaveBeenCalled(); // Não deve chamar o repo com ID inválido
    expect(result).toBeNull();
  });

  it('should return null if ID is not a string (e.g. undefined)', async () => {
    // @ts-expect-error testando tipo inválido
    const result = await getProductByIdUseCase(undefined);
    expect(mockProductRepo.findById).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });


  it('should throw an error if the repository call fails', async () => {
    const repositoryError = new Error('Database query failed');
    (mockProductRepo.findById as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);
    const productId = 'prod_error';

    await expect(getProductByIdUseCase(productId)).rejects.toThrow(repositoryError);
    expect(mockProductRepo.findById).toHaveBeenCalledWith(productId);
  });
});
