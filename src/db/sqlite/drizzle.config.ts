// import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/db/sqlite/schema/*",
  out: "./src/db/sqlite/migrations",
  verbose: true,
  strict: true,
});
