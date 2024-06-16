import { drizzle } from "drizzle-orm/better-sqlite3";
import database from "better-sqlite3";
import env from "@/db/sqlite/env";

const getConnectionDb = () => {
  const connection = new database(env.DATABASE_URL);
  const db = drizzle(connection, { logger: true });
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
