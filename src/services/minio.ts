import env from "@/db/postgres/env";
import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: env.MINIO_URL,
  port: 443,
  useSSL: true,
  accessKey: env.MINIO_ACCESSKEY,
  secretKey: env.MINIO_SECRETKEY,
});

export { minioClient };
