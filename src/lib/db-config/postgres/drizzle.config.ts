// import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/lib/db-config/postgres/schema/*",
  out: "./src/lib/db-config/postgres/migrations",
  verbose: true,
  strict: true,
});
