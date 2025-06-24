import { describe, it, expect, vi, beforeEach } from 'vitest';
import getUrlUploadUseCase, { Input as GetUrlUploadInput, Output as GetUrlUploadOutput } from './getUrlUploadUseCase';
import { getPresignedUrlPutObject as actualGetPresignedUrlPutObject } from '@/services/minio';
import * as cryptoModule from 'node:crypto'; // To access the original if needed, but mostly for vi.mock target
// import env from '@/db/postgres/env'; // Will be mocked

// Mock env from @/db/postgres/env
const MOCK_TEST_BUCKET_NAME = 'mocked-test-bucket-for-product-upload';
vi.mock('@/db/postgres/env', () => ({
  default: {
    MINIO_BUCKET_PRODUCTS: MOCK_TEST_BUCKET_NAME,
    // Add other env vars if the use case starts depending on them
    // For now, only MINIO_BUCKET_PRODUCTS is directly used by getUrlUploadUseCase
  },
}));

// Mock the minio service
vi.mock('@/services/minio', () => ({
  getPresignedUrlPutObject: vi.fn(),
}));

// Mock crypto.randomUUID
// We need to ensure that 'crypto.randomUUID' used by the use case is the mocked one.
// The use case uses 'import { randomUUID } from "crypto";' which resolves to 'node:crypto' in Node env.
vi.mock('node:crypto', async (importOriginal) => {
  const originalCrypto = await importOriginal<typeof cryptoModule>();
  return {
    ...originalCrypto,
    randomUUID: vi.fn(),
  };
});

// Typed mock functions
// After vi.mock, the import will yield the mock
const mockGetPresignedUrlPutObject = actualGetPresignedUrlPutObject as vi.Mock;
const mockRandomUUID = cryptoModule.randomUUID as vi.Mock; // This now refers to the mocked vi.fn()

describe('getUrlUploadUseCase', () => {
  const mockFileExt = 'jpg';
  const mockGeneratedUUID = 'test-uuid-12345';
  const expectedObjectName = `${mockGeneratedUUID}.${mockFileExt}`;
  // const mockBucketName = env.MINIO_BUCKET_PRODUCTS; // env is now mocked
  const mockBucketName = MOCK_TEST_BUCKET_NAME; // Use the constant from the mock setup
  const mockPresignedUrl = `https://s3.example.com/${mockBucketName}/${expectedObjectName}?signature=verysecret`;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock implementations
    mockRandomUUID.mockReturnValue(mockGeneratedUUID);
    // MINIO_BUCKET_PRODUCTS should be available from .env.test or the fallback in env.ts
    // If env.MINIO_BUCKET_PRODUCTS is not 'test_products_bucket' (from .env.test) or 'products' (schema default),
    // then the test might pick up an unexpected value if env.ts defaults kicked in differently.
    // For robustness, tests involving env vars often also mock 'env' or specific process.env values.
    // However, for T01.4.2.1 (success case), we assume env is correctly set up by global test config.
    // The specific test for MINIO_BUCKET_NAME absence is T01.4.2.4.
  });

  it('T01.4.2.1: should return a presigned URL on successful MinIO service call', async () => {
    mockGetPresignedUrlPutObject.mockResolvedValue(mockPresignedUrl);

    const input: GetUrlUploadInput = { fileExt: mockFileExt };
    const result: GetUrlUploadOutput = await getUrlUploadUseCase(input);

    expect(mockRandomUUID).toHaveBeenCalledTimes(1);
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

    // Expect the use case to throw (or reject with) the error from the service
    await expect(getUrlUploadUseCase(input)).rejects.toThrow(minioError);

    expect(mockRandomUUID).toHaveBeenCalledTimes(1); // Still called before the service
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledWith(
      mockBucketName,
      expectedObjectName,
      10 * 60
    );
  });

  it('T01.4.2.3: should throw an error if fileExt leads to an invalid object name for MinIO', async () => {
    const invalidFileExt = ''; // Results in objectName like "uuid."
    const potentiallyInvalidObjectName = `${mockGeneratedUUID}.${invalidFileExt}`;

    // Simulate the MinIO service rejecting an invalid object name
    const invalidObjectNameError = new Error('Invalid object name for MinIO');
    mockGetPresignedUrlPutObject.mockImplementation(async (bucket, objectName) => {
      if (objectName === potentiallyInvalidObjectName) {
        throw invalidObjectNameError;
      }
      return mockPresignedUrl; // Fallback for other names, though not expected in this test
    });

    const input: GetUrlUploadInput = { fileExt: invalidFileExt };

    await expect(getUrlUploadUseCase(input)).rejects.toThrow(invalidObjectNameError);

    expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledTimes(1);
    expect(mockGetPresignedUrlPutObject).toHaveBeenCalledWith(
      mockBucketName,
      potentiallyInvalidObjectName,
      10 * 60
    );
  });

  it('T01.4.2.4: should throw an error if MINIO_BUCKET_PRODUCTS is not defined in env', async () => {
    // Temporarily modify the mocked env for this test case
    const originalBucketName = (await import('@/db/postgres/env')).default.MINIO_BUCKET_PRODUCTS;
    (await import('@/db/postgres/env')).default.MINIO_BUCKET_PRODUCTS = undefined as any; // Force undefined

    const input: GetUrlUploadInput = { fileExt: mockFileExt };

    // Expect an error because bucketName would be undefined.
    // The actual error might come from the minioService when it receives an undefined bucket.
    // For this test, we'll assume it results in a TypeError or a specific error thrown by getPresignedUrlPutObject.
    // If getPresignedUrlPutObject is robust, it should throw a meaningful error.
    // If not, the error might be less specific (e.g. TypeError from trying to use undefined).
    // The use case itself doesn't explicitly check if bucketName is undefined.

    // Let's make the mock for getPresignedUrlPutObject also check for undefined bucketName for clarity.
    const undefinedBucketError = new Error('Bucket name must be defined');
    mockGetPresignedUrlPutObject.mockImplementation(async (bucket, objectName) => {
      if (bucket === undefined) {
        throw undefinedBucketError;
      }
      return mockPresignedUrl;
    });

    await expect(getUrlUploadUseCase(input)).rejects.toThrow(undefinedBucketError);

    expect(mockRandomUUID).toHaveBeenCalledTimes(1); // Called to generate objectName

    // Restore the original mocked env value
    (await import('@/db/postgres/env')).default.MINIO_BUCKET_PRODUCTS = originalBucketName;
  });
});
