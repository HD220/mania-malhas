import { getPresignedUrlPutObject } from "@/services/minio";
import { randomUUID } from "crypto";

export type Input = {
  fileExt: string;
  // isPublic?: boolean;
};

export type Output = {
  url: string;
  expiration: number;
};

export default async function getUrlUploadUseCase({
  fileExt,
}: Input): Promise<Output> {
  const s3name = `${randomUUID()}.${fileExt}`;
  const bucketName = `products`;
  const tenMinutesInSeconds = 60 * 10;

  const url = await getPresignedUrlPutObject(
    bucketName,
    s3name,
    tenMinutesInSeconds
  );

  return { url, expiration: tenMinutesInSeconds };
}
