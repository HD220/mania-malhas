import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "process";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool);

export default async function Home() {
  const result = await db.select().from("teste");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"></main>
  );
}
