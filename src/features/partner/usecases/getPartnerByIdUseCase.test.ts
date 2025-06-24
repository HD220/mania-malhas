import { describe, it, expect, vi, beforeEach } from 'vitest';
import getPartnerByIdUseCase from './getPartnerByIdUseCase';
import { partnerRepository } from '@/features/partner/db/partnerRepository';
import { SelectPartner } from '@/features/partner/schemas/partnerSchema';
import { faker } from '@faker-js/faker';

// Mock do partnerRepository
vi.mock('@/features/partner/db/partnerRepository', () => ({
  partnerRepository: vi.fn().mockReturnValue({
    findById: vi.fn(),
  }),
}));

const mockPartner: SelectPartner = {
  id: faker.string.uuid(),
  name: faker.company.name(),
  phone: faker.phone.number(),
  notes: faker.lorem.sentence(),
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('getPartnerByIdUseCase', () => {
  let mockPartnerRepo: ReturnType<typeof partnerRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPartnerRepo = partnerRepository(vi.fn() as any);
  });

  it('should return a partner if found by ID', async () => {
    (mockPartnerRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockPartner);
    const partnerId = mockPartner.id!; // Usar um ID válido do mock
    const result = await getPartnerByIdUseCase(partnerId);

    expect(mockPartnerRepo.findById).toHaveBeenCalledWith(partnerId);
    expect(result).toEqual(mockPartner);
  });

  it('should return null if partner is not found by ID', async () => {
    const nonExistentId = faker.string.uuid();
    (mockPartnerRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await getPartnerByIdUseCase(nonExistentId);

    expect(mockPartnerRepo.findById).toHaveBeenCalledWith(nonExistentId);
    expect(result).toBeNull();
  });

  it('should return null if ID is an empty string', async () => {
    const result = await getPartnerByIdUseCase('');
    expect(mockPartnerRepo.findById).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null if ID is undefined', async () => {
    // @ts-expect-error Testando tipo inválido
    const result = await getPartnerByIdUseCase(undefined);
    expect(mockPartnerRepo.findById).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should throw an error if the repository call fails', async () => {
    const repositoryError = new Error('Database query failed');
    const partnerIdWithError = faker.string.uuid();
    (mockPartnerRepo.findById as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    await expect(getPartnerByIdUseCase(partnerIdWithError)).rejects.toThrow(repositoryError);
    expect(mockPartnerRepo.findById).toHaveBeenCalledWith(partnerIdWithError);
  });
});
