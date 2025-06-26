import { drizzle } from "drizzle-orm/postgres-js";
import database from "postgres";
import env from "@/lib/db-config/postgres/env"; // Updated import
import schema from "./schema"; // Import the aggregated schema

const getConnectionDb = () => {
  const connection = database(env.DATABASE_URL, {
    max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,
    onnotice: env.DB_SEEDING ? () => {} : undefined,
  });
  // Pass the aggregated schema to drizzle
  const db = drizzle(connection, { schema, logger: false });
  return {
    connection,
    db,
  };
};

declare const globalThis: {
  dbGlobal: ReturnType<typeof getConnectionDb>;
} & typeof global;

const conn = globalThis.dbGlobal ?? getConnectionDb();

export type dbType = typeof conn;

export const db = conn.db;
export const connection = conn.connection;

if (process.env.NODE_ENV !== "production") globalThis.dbGlobal = conn;
