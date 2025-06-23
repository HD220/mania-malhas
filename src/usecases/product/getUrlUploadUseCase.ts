import { getPresignedUrlPutObject } from "@/services/minio";
import { randomUUID } from "crypto";
import env from "@/db/postgres/env";

/**
 * Defines the input structure for the `getUrlUploadUseCase`.
 */
export type Input = {
  /** The file extension of the image to be uploaded (e.g., "jpg", "png"). */
  fileExt: string;
};

/**
 * Defines the output structure of the `getUrlUploadUseCase`.
 */
export type Output = {
  /** The presigned PUT URL generated for uploading the file to MinIO. */
  url: string;
};

/**
 * Generates a presigned URL for uploading a product image directly to MinIO.
 *
 * This use case is invoked to get a temporary URL that grants write permission
 * to a specific object in the MinIO bucket. The client-side (e.g., `useProductForm`)
 * will use this URL to perform a PUT request with the file data.
 *
 * The object name is generated randomly to ensure uniqueness.
 * The bucket used is defined by the `MINIO_BUCKET_PRODUCTS` environment variable.
 * The presigned URL is typically valid for a short period (e.g., 10 minutes).
 *
 * After a successful upload using this presigned URL, the client is responsible for
 * constructing the permanent, public URL of the uploaded image. This is usually done
 * by taking the base URL of the MinIO endpoint, the bucket name, and the object name
 * (which is part of the presigned URL path).
 *
 * @param {Input} params - The input parameters for generating the URL.
 * @param {string} params.fileExt - The file extension of the image to be uploaded (e.g., "jpg", "png").
 * @returns {Promise<Output>} A promise that resolves to an object containing the presigned PUT URL.
 * @throws {Error} If there's an issue generating the presigned URL (e.g., MinIO service error).
 */
export default async function getUrlUploadUseCase({
  fileExt,
}: Input): Promise<Output> {
  const objectName = `${randomUUID()}.${fileExt}`;
  const bucketName = env.MINIO_BUCKET_PRODUCTS;
  const tenMinutesInSeconds = 10 * 60; // Standard expiration for presigned PUT URLs

  const presignedPutUrl = await getPresignedUrlPutObject(
    bucketName,
    objectName,
    tenMinutesInSeconds
  );

  // The URL returned to the client is the one they will use to PUT the file.
  // The client-side (e.g., useProductForm) will then construct the final public URL
  // by taking the base of this presignedPutUrl (i.e., MINIO_ENDPOINT/MINIO_BUCKET_PRODUCTS/objectName).
  return { url: presignedPutUrl };
}
