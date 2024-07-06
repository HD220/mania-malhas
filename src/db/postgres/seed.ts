import { sql } from "drizzle-orm";
import env from "@/db/postgres/env";
import { db } from ".";

async function main() {
  if (!env.DB_SEEDING) {
    throw new Error('You must set DB_SEEDING to "true" when running seeds');
  }

  console.log("⏳ Resetting database...");
  const start = Date.now();

  const query = sql`
		-- Delete all tables
		DO $$ DECLARE
		    r RECORD;
		BEGIN
		    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
		        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
		    END LOOP;
		END $$;
		
		-- Delete enums
		DO $$ DECLARE
			r RECORD;
		BEGIN
			FOR r IN (select t.typname as enum_name
			from pg_type t 
				join pg_enum e on t.oid = e.enumtypid  
				join pg_catalog.pg_namespace n ON n.oid = t.typnamespace
			where n.nspname = current_schema()) LOOP
				EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.enum_name);
			END LOOP;
		END $$;
		
		`;

  await db.execute(query);

  const end = Date.now();
  console.log(`✅ Reset end & took ${end - start}ms`);
  console.log("");
  process.exit(0);
}

await main();

// async function resetTable(db: dbType["db"], table: Table) {
//   return db.execute(
//     sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
//   );
// }

// for (const table of [
//   schema.user,
// ]) {
//   await resetTable(db, table);
// }

// await seeds.user(db);

// await connection.end();
