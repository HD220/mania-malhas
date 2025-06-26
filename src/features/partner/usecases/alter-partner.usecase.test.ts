import { describe, it, expect, vi, beforeEach } from 'vitest';
import alterPartnerUseCase from './alter-partner.usecase'; // Updated
import { partnerRepository } from '@/features/partner/db/partner-repository'; // Updated
import { InsertPartner, insertPartnerSchema } from '@/features/partner/schemas/partner.schema';
import { ZodError } from 'zod';
import { faker } from '@faker-js/faker';

// Mock do partnerRepository
vi.mock('@/features/partner/db/partner-repository', () => ({ // Updated
  partnerRepository: vi.fn().mockReturnValue({
    update: vi.fn(),
    findById: vi.fn(), // Added findById as the use case now calls it
  }),
}));

describe('alterPartnerUseCase', () => {
  let mockPartnerRepo: ReturnType<typeof partnerRepository>;
  let partnerId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    // Since partnerRepository is a factory, we call it to get the mocked instance's methods
    mockPartnerRepo = partnerRepository(vi.fn() as any); // Pass a mock DB instance
    partnerId = faker.string.uuid();
  });

  const validUpdateData: InsertPartner = {
    name: 'Updated Partner Name',
    phone: '11987654321', // 11 digits
    active: false,
    notes: 'Updated notes.',
  };

  const updatedPartnerMock = { ...validUpdateData, id: partnerId, createdAt: new Date(), updatedAt: new Date() };


  it('should update a partner successfully and return the updated partner', async () => {
    (mockPartnerRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mockPartnerRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(updatedPartnerMock); // Mock findById

    const parsedData = insertPartnerSchema.parse(validUpdateData);

    const result = await alterPartnerUseCase(partnerId, validUpdateData);

    expect(mockPartnerRepo.update).toHaveBeenCalledTimes(1);
    expect(mockPartnerRepo.update).toHaveBeenCalledWith(partnerId, parsedData);
    expect(mockPartnerRepo.findById).toHaveBeenCalledWith(partnerId); // Verify findById was called
    expect(result).toEqual(updatedPartnerMock);
  });

  it('should throw Error if ID is not provided', async () => {
    const expectedErrorMessage = "Invalid Partner ID provided for alteration.";
    // @ts-expect-error Testando ID nulo
    await expect(alterPartnerUseCase(null, validUpdateData)).rejects.toThrow(expectedErrorMessage);
    // @ts-expect-error Testando ID undefined
    await expect(alterPartnerUseCase(undefined, validUpdateData)).rejects.toThrow(expectedErrorMessage);
    await expect(alterPartnerUseCase('', validUpdateData)).rejects.toThrow(expectedErrorMessage);
    expect(mockPartnerRepo.update).not.toHaveBeenCalled();
  });

  it('should throw ZodError for invalid data (e.g., name too short)', async () => {
    const invalidData = { ...validUpdateData, name: '' };
    try {
      await alterPartnerUseCase(partnerId, invalidData);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('name'))).toBe(true);
      }
    }
    expect(mockPartnerRepo.update).not.toHaveBeenCalled();
  });

  it('should throw ZodError for invalid phone number', async () => {
    const invalidData = { ...validUpdateData, phone: '123' };
    try {
      await alterPartnerUseCase(partnerId, invalidData);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('phone'))).toBe(true);
      }
    }
    expect(mockPartnerRepo.update).not.toHaveBeenCalled();
  });

  it('should throw an error if repository.update fails', async () => {
    const repositoryError = new Error('Database update failed');
    (mockPartnerRepo.update as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);
    // const parsedData = insertPartnerSchema.parse(validUpdateData); // Not needed if update fails

    await expect(alterPartnerUseCase(partnerId, validUpdateData)).rejects.toThrow(repositoryError);
    // findById should not be called if update fails
    expect(mockPartnerRepo.findById).not.toHaveBeenCalled();
  });

  it('should return null if repository.findById returns null after update', async () => {
    (mockPartnerRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mockPartnerRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await alterPartnerUseCase(partnerId, validUpdateData);
    expect(result).toBeNull();
  });
});
