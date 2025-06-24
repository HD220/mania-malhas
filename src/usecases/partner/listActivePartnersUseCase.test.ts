import { describe, it, expect, vi, beforeEach } from 'vitest';
import listActivePartnersUseCase from './listActivePartnersUseCase';
import { partnerRepository } from '@/db/repositories/partnerRepository';
import { SelectPartner } from '@/features/partner/schemas/partnerSchema';
import { faker } from '@faker-js/faker';

// Mock do partnerRepository
vi.mock('@/db/repositories/partnerRepository', () => ({
  partnerRepository: vi.fn().mockReturnValue({
    findAll: vi.fn(), // Mocking findAll
  }),
}));

const createMockPartner = (id: string, name: string, active: boolean): SelectPartner => ({
  id,
  name,
  phone: faker.phone.number(),
  notes: faker.lorem.sentence(),
  active,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('listActivePartnersUseCase', () => {
  let mockPartnerRepo: ReturnType<typeof partnerRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPartnerRepo = partnerRepository(vi.fn() as any);
  });

  it('should return a list of active partners', async () => {
    const mockActivePartners = [
      createMockPartner('1', 'Active Partner 1', true),
      createMockPartner('2', 'Active Partner 2', true),
    ];
    (mockPartnerRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(mockActivePartners);

    const result = await listActivePartnersUseCase();

    expect(mockPartnerRepo.findAll).toHaveBeenCalledWith(true); // Expects to be called for active partners
    expect(result).toEqual(mockActivePartners);
    expect(result.length).toBe(2);
  });

  it('should return an empty array if no active partners are found', async () => {
    (mockPartnerRepo.findAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await listActivePartnersUseCase();

    expect(mockPartnerRepo.findAll).toHaveBeenCalledWith(true);
    expect(result).toEqual([]);
  });

  it('should throw an error if the repository call fails', async () => {
    const repositoryError = new Error('Database query failed');
    (mockPartnerRepo.findAll as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    await expect(listActivePartnersUseCase()).rejects.toThrow(repositoryError);
  });
});
