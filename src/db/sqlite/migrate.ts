import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import config from "./drizzle.config";
import { db } from "@/db/sqlite";
import env from "@/db/sqlite/env";

async function main() {
  if (!env.DB_MIGRATING) {
    throw new Error(
      'You must set DB_MIGRATING to "true" when running migrations'
    );
  }

  const migrateConfig = {
    migrationsFolder: config.out!,
  };

  migrate(db, migrateConfig);
  // await connection.end();
}

main();
