import env from "@/db/sqlite/env";
import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: "play.min.io", //env.MINIO_URL,
  port: 9000,
  useSSL: true,
  accessKey: "Q3AM3UQ867SPQQA43P2F", //env.MINIO_ACCESSKEY,
  secretKey: "zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG", //env.MINIO_SECRETKEY,
});
