import { faker } from '@faker-js/faker';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { partnerRepository } from '@/features/partner/db/partner-repository'; // Updated
import { SelectPartner } from '@/features/partner/types/partner.schema';

import searchPartnersUseCase from './search-partners.usecase'; // Updated

// Mock do partnerRepository
vi.mock('@/features/partner/db/partner-repository', () => ({ // Updated
  partnerRepository: vi.fn().mockReturnValue({
    findBySearch: vi.fn(),
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

describe('searchPartnersUseCase', () => {
  let mockPartnerRepo: ReturnType<typeof partnerRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPartnerRepo = partnerRepository(vi.fn() as any);
  });

  it('should return partners matching search term and status', async () => {
    const searchTerm = 'Acme';
    const status = true;
    const mockResults = [createMockPartner('1', 'Acme Corp', true)];
    (mockPartnerRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

    const result = await searchPartnersUseCase(searchTerm, status);

    expect(mockPartnerRepo.findBySearch).toHaveBeenCalledWith(searchTerm.trim(), status);
    expect(result).toEqual(mockResults);
  });

  it('should return empty array if no partners match', async () => {
    const searchTerm = 'NonExistent';
    const status = true;
    (mockPartnerRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await searchPartnersUseCase(searchTerm, status);

    expect(mockPartnerRepo.findBySearch).toHaveBeenCalledWith(searchTerm.trim(), status);
    expect(result).toEqual([]);
  });

  it('should trim the search term before passing to repository', async () => {
    const searchTermWithSpaces = '  Search Me  ';
    const status = false;
    (mockPartnerRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await searchPartnersUseCase(searchTermWithSpaces, status);

    expect(mockPartnerRepo.findBySearch).toHaveBeenCalledWith('Search Me', status);
  });

  it('should use default status true if not provided', async () => {
    const searchTerm = 'Any';
    (mockPartnerRepo.findBySearch as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await searchPartnersUseCase(searchTerm);
    expect(mockPartnerRepo.findBySearch).toHaveBeenCalledWith(searchTerm, true);
  });

  it('should throw an error if repository call fails', async () => {
    const searchTerm = 'Test';
    const status = true;
    const repositoryError = new Error('DB Error');
    (mockPartnerRepo.findBySearch as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    await expect(searchPartnersUseCase(searchTerm, status)).rejects.toThrow(repositoryError);
  });
});
