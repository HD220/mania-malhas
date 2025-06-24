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

// Load .env files into process.env. This should happen once.
// Vitest also handles .env file loading, so this ensures it's done if not already.
expand(config());

// Validate process.env after dotenv (and potentially Vitest's loader) has populated it.
// This try-catch is crucial for early feedback on missing env variables.
try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "ERROR: Missing or invalid environment variables (validated in env.ts):\n";
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      message += `- ${path}: ${issue.message}\n`;
    });
    const e = new Error(message);
    e.stack = ""; // Reduce noise in console output
    throw e; // Throw to prevent application startup with invalid config
  } else {
    // Catch any other unexpected errors during the initial parse attempt
    console.error(
      "CRITICAL: Unexpected error during initial environment variable parsing in env.ts:",
      error
    );
    throw error; // Re-throw to halt execution
  }
}

// Export the validated and parsed environment variables.
// This parse operation also serves as the definitive check if the try-catch above were removed.
export default EnvSchema.parse(process.env);
