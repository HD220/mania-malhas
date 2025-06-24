import { describe, it, expect, vi, beforeEach } from 'vitest';
import alterPartnerUseCase from './alterPartnerUseCase';
import { partnerRepository } from '@/features/partner/db/partnerRepository';
import { InsertPartner, insertPartnerSchema } from '@/features/partner/schemas/partnerSchema';
import { ZodError } from 'zod';
import { faker } from '@faker-js/faker';

// Mock do partnerRepository
vi.mock('@/features/partner/db/partnerRepository', () => ({
  partnerRepository: vi.fn().mockReturnValue({
    update: vi.fn(),
  }),
}));

describe('alterPartnerUseCase', () => {
  let mockPartnerRepo: ReturnType<typeof partnerRepository>;
  let partnerId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPartnerRepo = partnerRepository(vi.fn() as any);
    partnerId = faker.string.uuid();
  });

  const validUpdateData: InsertPartner = {
    name: 'Updated Partner Name',
    phone: '11987654321', // 11 digits
    active: false,
    notes: 'Updated notes.',
  };

  it('should update a partner successfully with valid data', async () => {
    (mockPartnerRepo.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    // O schema parseia os dados antes de passar para o repo, então usamos o input original aqui
    // para o use case, e o parsed para a asserção do repo.
    const parsedData = insertPartnerSchema.parse(validUpdateData);


    await expect(alterPartnerUseCase(partnerId, validUpdateData)).resolves.toBeUndefined();

    expect(mockPartnerRepo.update).toHaveBeenCalledTimes(1);
    expect(mockPartnerRepo.update).toHaveBeenCalledWith(partnerId, parsedData);
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
    const invalidData = { ...validUpdateData, name: '' }; // Nome vazio, schema requer min(1)
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

  it('should throw an error if repository fails to update', async () => {
    const repositoryError = new Error('Database update failed');
    (mockPartnerRepo.update as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);
    const parsedData = insertPartnerSchema.parse(validUpdateData);

    await expect(alterPartnerUseCase(partnerId, validUpdateData)).rejects.toThrow(repositoryError);
    expect(mockPartnerRepo.update).toHaveBeenCalledWith(partnerId, parsedData);
  });
});
