import { getPresignedUrlPutObject } from "@/services/minio";
import { randomUUID } from "crypto";
import env from "@/db/postgres/env"; // Import env

export type Input = {
  fileExt: string;
  // isPublic?: boolean; // Kept for reference, not used currently
};

export type Output = {
  url: string; // This is the presigned PUT URL
  // expiration: number; // Expiration is an implementation detail of presigned URL, not strictly needed by client if not displayed
};

export default async function getUrlUploadUseCase({
  fileExt,
}: Input): Promise<Output> {
  const objectName = `${randomUUID()}.${fileExt}`; // Renamed s3name to objectName for clarity
  const bucketName = env.MINIO_BUCKET_PRODUCTS; // Use bucket name from env
  const tenMinutesInSeconds = 10 * 60; // Standard expiration for presigned PUT URLs

  const presignedPutUrl = await getPresignedUrlPutObject(
    bucketName,
    objectName,
    tenMinutesInSeconds
  );

  // The URL returned to the client is the one they will use to PUT the file.
  // The client-side (useProductForm) will then construct the final public URL
  // by taking the base of this presignedPutUrl.
  return { url: presignedPutUrl };
}
