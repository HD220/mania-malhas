import { describe, it, expect, vi, beforeEach } from 'vitest';
import getProductsUseCase from './getProductsUseCase';
import { productRepository } from '@/db/repositories/productRepository';
import { SelectProductWithImages } from '@/db/repositories/schemas/productImageSchema';
import { faker } from '@faker-js/faker';

// Mock do productRepository
vi.mock('@/db/repositories/productRepository', () => ({
  productRepository: vi.fn().mockReturnValue({
    findBySearch: vi.fn(),
    // Outros métodos não são diretamente chamados
  }),
}));

const createMockProduct = (id: string, name: string, active: boolean): SelectProductWithImages => ({
  id,
  name,
  price: parseFloat(faker.commerce.price()),
  active,
  description: faker.commerce.productDescription(),
  images: [{ id: faker.string.uuid(), name: 'img.jpg', url: faker.image.url(), active: true, productId: id, createdAt: new Date(), updatedAt: new Date() }],
  createdAt: new Date(),
  updatedAt: new Date(),
});


describe('getProductsUseCase', () => {
  let mockProductRepo: ReturnType<typeof productRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProductRepo = productRepository(vi.fn() as any); // Passa um mock de db
  });

  it('should fetch active products with an empty search term', async () => {
    const mockActiveProducts = [createMockProduct('1', 'Active Product 1', true)];
    (mockProductRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue(mockActiveProducts);

    const result = await getProductsUseCase('', true);

    expect(mockProductRepo.findBySearch).toHaveBeenCalledWith('', true);
    expect(result).toEqual(mockActiveProducts);
  });

  it('should fetch inactive products with an empty search term', async () => {
    const mockInactiveProducts = [createMockProduct('2', 'Inactive Product 1', false)];
    (mockProductRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue(mockInactiveProducts);

    const result = await getProductsUseCase('', false);

    expect(mockProductRepo.findBySearch).toHaveBeenCalledWith('', false);
    expect(result).toEqual(mockInactiveProducts);
  });

  it('should fetch products matching a search term and status', async () => {
    const searchTerm = 'Test';
    const mockFoundProducts = [createMockProduct('3', 'Test Product Active', true)];
    (mockProductRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue(mockFoundProducts);

    const result = await getProductsUseCase(searchTerm, true);

    expect(mockProductRepo.findBySearch).toHaveBeenCalledWith(searchTerm, true);
    expect(result).toEqual(mockFoundProducts);
  });

  it('should return an empty array if no products match the search criteria', async () => {
    const searchTerm = 'NonExistent';
    (mockProductRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await getProductsUseCase(searchTerm, true);

    expect(mockProductRepo.findBySearch).toHaveBeenCalledWith(searchTerm, true);
    expect(result).toEqual([]);
  });

  it('should throw an error if the repository call fails', async () => {
    const repositoryError = new Error('Database query failed');
    (mockProductRepo.findBySearch as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    await expect(getProductsUseCase('anySearch', true)).rejects.toThrow(repositoryError);
  });
});
