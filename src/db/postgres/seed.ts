import { Table, getTableName, sql } from "drizzle-orm";
import env from "@/db/postgres/env";
import { db, connection, dbType } from "@/db/postgres";
// import * as schema from "@/db/schema";
// import * as seeds from './seeds';

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

async function resetTable(db: dbType["db"], table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
  );
}

// for (const table of [
//   schema.user,
// ]) {
//   await resetTable(db, table);
// }

// await seeds.user(db);

// await connection.end();
