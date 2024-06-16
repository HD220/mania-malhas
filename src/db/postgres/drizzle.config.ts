// import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/db/postgres/schema/*",
  out: "./src/db/postgres/migrations",
  verbose: true,
  strict: true,
});
