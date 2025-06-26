/**
 * @fileoverview MinIO service client and utility functions.
 * This module configures and exports a MinIO client instance for interacting with
 * an S3-compatible object storage service. It also provides helper functions
 * for generating pre-signed URLs.
 * @module lib/clients/minio.client
 */

import env from "@/db/postgres/env";
import * as Minio from "minio";

/**
 * MinIO client instance configured with environment variables.
 * Used for all interactions with the MinIO server.
 *
 * @const {Minio.Client} minioClient
 * @remarks
 * - `endPoint`: The URL of the MinIO server.
 * - `port`: The port number for the MinIO server (defaults to 443 for SSL).
 * - `useSSL`: Specifies whether to use SSL (HTTPS) for the connection (defaults to true).
 * - `accessKey`: The access key for MinIO authentication.
 * - `secretKey`: The secret key for MinIO authentication.
 */
export const minioClient = new Minio.Client({
  endPoint: env.MINIO_URL,
  port: 443, // Assuming HTTPS, common for cloud storage. Adjust if MinIO is on a different port or HTTP.
  useSSL: true, // Set to false if MinIO is on HTTP.
  accessKey: env.MINIO_ACCESSKEY,
  secretKey: env.MINIO_SECRETKEY,
});

/**
 * Generates a pre-signed URL for uploading an object (PUT operation) to a MinIO bucket.
 * If the specified bucket does not exist, it will be created.
 *
 * @async
 * @function getPresignedUrlPutObject
 * @param {string} bucketName - The name of the bucket.
 * @param {string} objectName - The name of the object to be uploaded.
 * @param {number} expiration - The expiration time for the pre-signed URL in seconds.
 * @returns {Promise<string>} A promise that resolves to the pre-signed URL string.
 * @throws {Error} If there's an issue creating the bucket or generating the URL.
 */
export async function getPresignedUrlPutObject(
  bucketName: string,
  objectName: string,
  expiration: number // in seconds
): Promise<string> {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      // Note: Consider bucket creation policies and permissions.
      // In some environments, buckets might need to be pre-created by an administrator.
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket ${bucketName} created successfully.`);
      // Optionally, set a public policy if objects are meant to be publicly readable
      // This depends on the application's requirements. Example for public read:
      // const policy = `{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::${bucketName}/*"]}]}`;
      // await minioClient.setBucketPolicy(bucketName, policy);
      // console.log(`Public read policy set for bucket ${bucketName}.`);
    }

    return await minioClient.presignedPutObject(
      bucketName,
      objectName,
      expiration
    );
  } catch (error) {
    console.error("Error in getPresignedUrlPutObject:", error);
    throw new Error(
      `Failed to generate pre-signed PUT URL for ${objectName} in bucket ${bucketName}.`
    );
  }
}

// This function is no longer needed if product images are served via public URLs
// from a public bucket. Keeping it commented out for now in case other functionalities
// might require it in the future for non-public objects.
// If confirmed to be unused across the entire application, it can be deleted.

// /**
//  * Generates a pre-signed URL for retrieving an object (GET operation) from a MinIO bucket.
//  *
//  * @async
//  * @function getPresignedUrlGetObject
//  * @param {string} bucketName - The name of the bucket.
//  * @param {string} objectName - The name of the object to be retrieved.
//  * @param {number} expiration - The expiration time for the pre-signed URL in seconds.
//  * @returns {Promise<string>} A promise that resolves to the pre-signed URL string.
//  * @throws {Error} If the bucket does not exist or if there's an issue generating the URL.
//  * @remarks This function assumes the bucket already exists. It does not attempt to create it.
//  */
// export async function getPresignedUrlGetObject(
//   bucketName: string,
//   objectName: string,
//   expiration: number // in seconds
// ): Promise<string> {
//   try {
//     const bucketExists = await minioClient.bucketExists(bucketName);
//     if (!bucketExists) {
//       throw new Error(`Bucket ${bucketName} does not exist.`);
//     }
//     return await minioClient.presignedGetObject(
//       bucketName,
//       objectName,
//       expiration
//     );
//   } catch (error) {
//     console.error("Error in getPresignedUrlGetObject:", error);
//     throw new Error(
//       `Failed to generate pre-signed GET URL for ${objectName} in bucket ${bucketName}.`
//     );
//   }
// }
