import env from "@/db/postgres/env";
import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_URL,
  port: 443,
  useSSL: true,
  accessKey: env.MINIO_ACCESSKEY,
  secretKey: env.MINIO_SECRETKEY,
});

export async function getPresignedUrlPutObject(
  bucketName: string,
  objectName: string,
  expiration: number
) {
  if (!(await minioClient.bucketExists(bucketName))) {
    await minioClient.makeBucket(bucketName);
  }

  return await minioClient.presignedPutObject(
    bucketName,
    objectName,
    expiration
  );
}

export async function deleteObject(
  bucketName: string,
  objectName: string
): Promise<void> {
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.log(`Successfully deleted ${objectName} from bucket ${bucketName}`);
  } catch (err) {
    console.error(`Error deleting object ${objectName} from bucket ${bucketName}:`, err);
    // Decide if you want to re-throw the error or handle it (e.g., if object not found is not critical)
    // For now, let's re-throw to make the caller aware.
    throw err;
  }
}

export async function getPresignedUrlGetObject(
  bucketName: string,
  objectName: string,
  expiration: number
) {
  return await minioClient.presignedGetObject(
    bucketName,
    objectName,
    expiration
  );
}
