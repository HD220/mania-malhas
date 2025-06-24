import { config } from "dotenv";
import { expand } from "dotenv-expand";

import { ZodError, z } from "zod";

const stringBoolean = z.coerce
  .string()
  .transform((val) => {
    return val === "true";
  })
  .default("false");

const EnvSchema = z.object({
  NODE_ENV: z
    .union([
      z.literal("production"),
      z.literal("development"),
      z.literal("test"), // Adicionar 'test' como valor válido
    ])
    .default("development"),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  DB_MIGRATING: stringBoolean,
  DB_SEEDING: stringBoolean,
  MINIO_URL: z.string(),
  MINIO_ACCESSKEY: z.string(),
  MINIO_SECRETKEY: z.string(),
  MINIO_BUCKET_PRODUCTS: z.string().default("products"), // Default to "products" but can be overridden
});

export type EnvSchema = z.infer<typeof EnvSchema>;

expand(config());

// Ensure process.env is mutable for test environment defaults
const envSource = { ...process.env };

if (envSource.NODE_ENV === 'test') {
  envSource.DB_HOST = envSource.DB_HOST || 'test_db_host_from_env_ts';
  envSource.DB_USER = envSource.DB_USER || 'test_db_user_from_env_ts';
  envSource.DB_PASSWORD = envSource.DB_PASSWORD || 'test_db_password_from_env_ts';
  envSource.DB_NAME = envSource.DB_NAME || 'test_db_name_from_env_ts';
  envSource.DB_PORT = envSource.DB_PORT || '5437'; // Different port to check source
  envSource.DATABASE_URL = envSource.DATABASE_URL || 'postgresql://test_user_envts:test_password_envts@test_host_envts:5437/test_db_name_envts';
  envSource.MINIO_URL = envSource.MINIO_URL || 'http://test_minio_from_env_ts:9000';
  envSource.MINIO_ACCESSKEY = envSource.MINIO_ACCESSKEY || 'test_minio_key_from_env_ts';
  envSource.MINIO_SECRETKEY = envSource.MINIO_SECRETKEY || 'test_minio_secret_from_env_ts';
  // MINIO_BUCKET_PRODUCTS has a default in schema
  // DB_MIGRATING and DB_SEEDING have defaults in schema
}

expand(config());

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n";
    error.issues.forEach((issue) => {
      message += issue.path[0] + "\n";
    });
    const e = new Error(message);
    e.stack = "";
    throw e;
  } else {
    console.error(error);
  }
}

export default EnvSchema.parse(process.env);
