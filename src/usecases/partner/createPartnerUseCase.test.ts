import { describe, it, expect, vi, beforeEach } from 'vitest';
import createPartnerUseCase from './createPartnerUseCase';
import { partnerRepository } from '@/db/repositories/partnerRepository';
import { InsertPartner, insertPartnerSchema } from '@/db/repositories/schemas/partnerSchema';
import { ZodError } from 'zod';

// Mock do repositório de parceiros
vi.mock('@/db/repositories/partnerRepository', () => ({
  partnerRepository: vi.fn().mockReturnValue({
    insert: vi.fn(),
  }),
}));

describe('createPartnerUseCase', () => {
  let mockPartnerRepo: ReturnType<typeof partnerRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPartnerRepo = partnerRepository(vi.fn() as any);
  });

  it('should create a partner successfully with valid data', async () => {
    const validInput: InsertPartner = {
      name: 'Test Partner',
      phone: '1234567890', // 10 digits
      active: true,
      // notes: 'Some notes' // optional
    };
    // Garantir que o input de teste é válido conforme o schema, incluindo o default de 'active' se não provido
    const parsedInput = insertPartnerSchema.parse(validInput);


    const mockRepoResponse = { id: 'new-partner-id' };
    (mockPartnerRepo.insert as ReturnType<typeof vi.fn>).mockResolvedValue(mockRepoResponse);

    const result = await createPartnerUseCase(parsedInput);

    expect(mockPartnerRepo.insert).toHaveBeenCalledTimes(1);
    expect(mockPartnerRepo.insert).toHaveBeenCalledWith(parsedInput);
    expect(result).toEqual(mockRepoResponse);
  });

  it('should create a partner successfully with 11-digit phone', async () => {
    const validInput: InsertPartner = {
      name: 'Test Partner 11',
      phone: '12345678901', // 11 digits
      active: false,
    };
    const parsedInput = insertPartnerSchema.parse(validInput);

    const mockRepoResponse = { id: 'new-partner-id-11' };
    (mockPartnerRepo.insert as ReturnType<typeof vi.fn>).mockResolvedValue(mockRepoResponse);

    const result = await createPartnerUseCase(parsedInput);
    expect(mockPartnerRepo.insert).toHaveBeenCalledWith(parsedInput);
    expect(result).toEqual(mockRepoResponse);
  });


  it('should throw ZodError for invalid data (missing name)', async () => {
    const invalidInput = {
      phone: '1234567890',
    } as InsertPartner;

    try {
      await createPartnerUseCase(invalidInput);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('name'))).toBe(true);
      }
    }
    expect(mockPartnerRepo.insert).not.toHaveBeenCalled();
  });

  it('should throw ZodError for invalid phone (too short)', async () => {
    const invalidInput: InsertPartner = {
      name: 'Test Partner Invalid Phone',
      phone: '123', // too short
    };
     try {
      await createPartnerUseCase(invalidInput);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('phone'))).toBe(true);
      }
    }
    expect(mockPartnerRepo.insert).not.toHaveBeenCalled();
  });

  it('should throw ZodError for invalid phone (too long)', async () => {
    const invalidInput: InsertPartner = {
      name: 'Test Partner Invalid Phone Long',
      phone: '123456789012', // too long
    };
     try {
      await createPartnerUseCase(invalidInput);
      expect.fail('Should have thrown ZodError');
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      if (error instanceof ZodError) {
        expect(error.errors.some(e => e.path.includes('phone'))).toBe(true);
      }
    }
    expect(mockPartnerRepo.insert).not.toHaveBeenCalled();
  });

  it('should throw an error if repository fails to insert', async () => {
    const validInput: InsertPartner = {
      name: 'Test Partner Repo Fail',
      phone: '0987654321',
      active: true,
    };
    const parsedInput = insertPartnerSchema.parse(validInput);

    const repositoryError = new Error('Database connection failed for partner');
    (mockPartnerRepo.insert as ReturnType<typeof vi.fn>).mockRejectedValue(repositoryError);

    try {
      await createPartnerUseCase(parsedInput);
      expect.fail('Should have thrown repository error');
    } catch (error) {
      expect(error).toBe(repositoryError);
    }
    expect(mockPartnerRepo.insert).toHaveBeenCalledWith(parsedInput);
  });
});
