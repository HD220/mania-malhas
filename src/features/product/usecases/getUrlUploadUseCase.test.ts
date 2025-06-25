import { describe, it, expect, vi, beforeEach } from 'vitest';
import getUrlUploadUseCase, { Input as GetUrlUploadInput, Output as GetUrlUploadOutput } from './getUrlUploadUseCase';
import { getPresignedUrlPutObject as actualGetPresignedUrlPutObject } from '@/services/minio';
// import env from '@/db/postgres/env'; // Will be mocked

// Mock o wrapper do UUID
vi.mock('@/utils/uuidUtils', () => ({
  generateUniqueId: vi.fn().mockReturnValue('test-uuid-12345'),
}));

// Mock env from @/db/postgres/env
// IMPORTANT: Variables used inside the factory must be defined literally or imported,
// as top-level consts from this file are not initialized yet when the hoisted mock factory runs.
vi.mock('@/db/postgres/env', () => ({
  default: {
    MINIO_BUCKET_PRODUCTS: 'mocked-test-bucket-for-product-upload', // Use literal string
    // Add other env vars if the use case starts depending on them
    // For now, only MINIO_BUCKET_PRODUCTS is directly used by getUrlUploadUseCase
  },
}));

// This const is for use within the test file's `describe` and `it` blocks.
const MOCK_TEST_BUCKET_NAME = 'mocked-test-bucket-for-product-upload';

// Mock the minio service
vi.mock('@/services/minio', () => ({
  getPresignedUrlPutObject: vi.fn(),
}));

// Typed mock functions
// After vi.mock, the import will yield the mock
const mockGetPresignedUrlPutObject = actualGetPresignedUrlPutObject as vi.Mock;

// Importar o wrapper para asserções
import { generateUniqueId } from '@/utils/uuidUtils';

describe('getUrlUploadUseCase', () => {
  const mockFileExt = 'jpg';
  // Use the literal UUID value that the mock will return for consistent object names
  const expectedObjectName = `test-uuid-12345.${mockFileExt}`;
  const mockBucketName = MOCK_TEST_BUCKET_NAME;
  const mockPresignedUrl = `https://s3.example.com/${mockBucketName}/${expectedObjectName}?signature=verysecret`;

  beforeEach(async () => { // Make beforeEach async if needed for imports
    vi.clearAllMocks();
  });

  it('T01.4.2.1: should return a presigned URL on successful MinIO service call', async () => {
    mockGetPresignedUrlPutObject.mockResolvedValue(mockPresignedUrl);

    const input: GetUrlUploadInput = { fileExt: mockFileExt };
    const result: GetUrlUploadOutput = await getUrlUploadUseCase(input);

    expect(generateUniqueId).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledWith(
      mockBucketName,
      expectedObjectName,
      10 * 60 // tenMinutesInSeconds
    );
    expect(result).toEqual({ url: mockPresignedUrl });
  });

  it('T01.4.2.2: should throw an error if MinIO service call fails', async () => {
    const minioError = new Error('MinIO service unavailable');
    mockGetPresignedUrlPutObject.mockRejectedValue(minioError);

    const input: GetUrlUploadInput = { fileExt: mockFileExt };

    await expect(getUrlUploadUseCase(input)).rejects.toThrow(minioError);

    expect(generateUniqueId).toHaveBeenCalledTimes(1); // Corrigido
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledWith(
      mockBucketName,
      expectedObjectName,
      10 * 60
    );
  });

  it('T01.4.2.3: should throw an error if fileExt leads to an invalid object name for MinIO', async () => {
    // const { randomUUID: mockedRandomUUID } = await import('node:crypto'); // Removido
    const invalidFileExt = '';
    const potentiallyInvalidObjectName = `test-uuid-12345.${invalidFileExt}`;

    const invalidObjectNameError = new Error('Invalid object name for MinIO');
    mockGetPresignedUrlPutObject.mockImplementation(async (bucket, objectName) => {
      if (objectName === potentiallyInvalidObjectName) {
        throw invalidObjectNameError;
      }
      return mockPresignedUrl;
    });

    const input: GetUrlUploadInput = { fileExt: invalidFileExt };

    await expect(getUrlUploadUseCase(input)).rejects.toThrow(invalidObjectNameError);

    expect(generateUniqueId).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledWith(
      mockBucketName,
      potentiallyInvalidObjectName,
      10 * 60
    );
  });

  it('T01.4.2.4: should throw an error if MINIO_BUCKET_PRODUCTS is not defined in env', async () => {
    // const { randomUUID: mockedRandomUUID } = await import('node:crypto'); // Removido
    const importedEnv = (await import('@/db/postgres/env')).default;
    const originalBucketName = importedEnv.MINIO_BUCKET_PRODUCTS;
    importedEnv.MINIO_BUCKET_PRODUCTS = undefined as any;

    const input: GetUrlUploadInput = { fileExt: mockFileExt };

    const undefinedBucketError = new Error('Bucket name must be defined');
    mockGetPresignedUrlPutObject.mockImplementation(async (bucket, objectName) => {
      if (bucket === undefined) {
        throw undefinedBucketError;
      }
      return mockPresignedUrl;
    });

    await expect(getUrlUploadUseCase(input)).rejects.toThrow(undefinedBucketError);

    expect(generateUniqueId).toHaveBeenCalledTimes(1);

    importedEnv.MINIO_BUCKET_PRODUCTS = originalBucketName;
  });
});
