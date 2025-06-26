import { getPresignedUrlPutObject } from "./minio.client"; // Updated import
import * as Minio from "minio";

// Mock the Minio client
jest.mock("minio");

// Mock environment variables if they were directly used by the function,
// but minioClient is instantiated outside and uses them.
// We are primarily mocking the client's behavior.
// jest.mock("@/db/postgres/env", () => ({
//   __esModule: true,
//   default: {
//     MINIO_URL: "mock-url",
//     MINIO_ACCESSKEY: "mock-accesskey",
//     MINIO_SECRETKEY: "mock-secretkey",
//     MINIO_BUCKET_NAME: "mock-bucket", // This is not used by getPresignedUrlPutObject directly
//   },
// }));

describe("MinIO Service Client", () => { // Updated describe
  describe("getPresignedUrlPutObject", () => {
    const mockBucketName = "test-bucket";
    const mockObjectName = "test-object.txt";
    const mockExpiration = 3600; // 1 hour
    const mockPresignedUrl = "https://mock-minio-server.com/test-bucket/test-object.txt?presigned-credentials";

    let mockMinioClientInstance: jest.Mocked<Minio.Client>;

    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();

      // Setup the mock implementation for the Minio.Client constructor
      // and its methods.
      // Note: The actual minioClient instance in minio.client.ts is created when the module is imported.
      // We need to ensure our mocks effectively replace its behavior.
      // A common way is to mock the module that exports the client, or ensure methods called on it are mocked.
      // Since minio.client.ts exports its own `minioClient`, we will mock the methods on that specific instance.
      // However, jest.mock("minio") at the top level mocks the entire 'minio' module.
      // So, when `new Minio.Client()` is called in minio.client.ts, it will use the mocked constructor.

      mockMinioClientInstance = {
        bucketExists: jest.fn(),
        makeBucket: jest.fn(),
        presignedPutObject: jest.fn(),
      } as unknown as jest.Mocked<Minio.Client>;

      // Configure Minio.Client to return our mock instance
      (Minio.Client as jest.Mock).mockImplementation(() => mockMinioClientInstance);

      // Since minioClient in minio.client.ts is instantiated on module load,
      // we might also need to directly mock the methods of the exported minioClient from "./minio.client"
      // if the top-level mock doesn't fully capture it for an already instantiated client.
      // For now, we assume the `jest.mock("minio")` and `(Minio.Client as jest.Mock).mockImplementation`
      // will effectively mock the client used by the function.
      // If not, we would do:
      // import { minioClient } from "./minio.client";
      // jest.spyOn(minioClient, 'bucketExists').mockImplementation(...);
      // etc. for other methods.
      // Let's try with the current setup first.
    });

    it("should generate a presigned URL and create bucket if it does not exist", async () => {
      // Arrange
      (mockMinioClientInstance.bucketExists as jest.Mock).mockResolvedValue(false);
      (mockMinioClientInstance.makeBucket as jest.Mock).mockResolvedValue(undefined);
      (mockMinioClientInstance.presignedPutObject as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Act
      const url = await getPresignedUrlPutObject(
        mockBucketName,
        mockObjectName,
        mockExpiration
      );

      // Assert
      expect(Minio.Client).toHaveBeenCalledTimes(1); // Verifies the client was "instantiated" (mocked constructor called)
      expect(mockMinioClientInstance.bucketExists).toHaveBeenCalledWith(mockBucketName);
      expect(mockMinioClientInstance.makeBucket).toHaveBeenCalledWith(mockBucketName);
      expect(mockMinioClientInstance.presignedPutObject).toHaveBeenCalledWith(
        mockBucketName,
        mockObjectName,
        mockExpiration
      );
      expect(url).toBe(mockPresignedUrl);
    });

    it("should generate a presigned URL if bucket already exists", async () => {
      // Arrange
      (mockMinioClientInstance.bucketExists as jest.Mock).mockResolvedValue(true);
      (mockMinioClientInstance.presignedPutObject as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Act
      const url = await getPresignedUrlPutObject(
        mockBucketName,
        mockObjectName,
        mockExpiration
      );

      // Assert
      expect(Minio.Client).toHaveBeenCalledTimes(1);
      expect(mockMinioClientInstance.bucketExists).toHaveBeenCalledWith(mockBucketName);
      expect(mockMinioClientInstance.makeBucket).not.toHaveBeenCalled();
      expect(mockMinioClientInstance.presignedPutObject).toHaveBeenCalledWith(
        mockBucketName,
        mockObjectName,
        mockExpiration
      );
      expect(url).toBe(mockPresignedUrl);
    });

    it("should throw an error if bucketExists fails", async () => {
      // Arrange
      const errorMessage = "Failed to check bucket existence";
      (mockMinioClientInstance.bucketExists as jest.Mock).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        getPresignedUrlPutObject(mockBucketName, mockObjectName, mockExpiration)
      ).rejects.toThrow(
        `Failed to generate pre-signed PUT URL for ${mockObjectName} in bucket ${mockBucketName}.`
      );
      expect(mockMinioClientInstance.bucketExists).toHaveBeenCalledWith(mockBucketName);
      expect(mockMinioClientInstance.makeBucket).not.toHaveBeenCalled();
      expect(mockMinioClientInstance.presignedPutObject).not.toHaveBeenCalled();
    });

    it("should throw an error if makeBucket fails", async () => {
      // Arrange
      const errorMessage = "Failed to create bucket";
      (mockMinioClientInstance.bucketExists as jest.Mock).mockResolvedValue(false);
      (mockMinioClientInstance.makeBucket as jest.Mock).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        getPresignedUrlPutObject(mockBucketName, mockObjectName, mockExpiration)
      ).rejects.toThrow(
        `Failed to generate pre-signed PUT URL for ${mockObjectName} in bucket ${mockBucketName}.`
      );
      expect(mockMinioClientInstance.bucketExists).toHaveBeenCalledWith(mockBucketName);
      expect(mockMinioClientInstance.makeBucket).toHaveBeenCalledWith(mockBucketName);
      expect(mockMinioClientInstance.presignedPutObject).not.toHaveBeenCalled();
    });

    it("should throw an error if presignedPutObject fails", async () => {
      // Arrange
      const errorMessage = "Failed to generate presigned URL";
      (mockMinioClientInstance.bucketExists as jest.Mock).mockResolvedValue(true);
      (mockMinioClientInstance.presignedPutObject as jest.Mock).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(
        getPresignedUrlPutObject(mockBucketName, mockObjectName, mockExpiration)
      ).rejects.toThrow(
        `Failed to generate pre-signed PUT URL for ${mockObjectName} in bucket ${mockBucketName}.`
      );
      expect(mockMinioClientInstance.bucketExists).toHaveBeenCalledWith(mockBucketName);
      expect(mockMinioClientInstance.presignedPutObject).toHaveBeenCalledWith(
        mockBucketName,
        mockObjectName,
        mockExpiration
      );
    });
  });
});
