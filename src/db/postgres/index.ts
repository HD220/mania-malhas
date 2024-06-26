import { drizzle } from "drizzle-orm/postgres-js";
import database from "postgres";
import env from "@/db/postgres/env";

const getConnectionDb = () => {
  const connection = database(env.DATABASE_URL, {
    max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,
    onnotice: env.DB_SEEDING ? () => {} : undefined,
  });
  const db = drizzle(connection, { logger: false });
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
