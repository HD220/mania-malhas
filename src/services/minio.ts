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
