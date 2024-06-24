import { db } from "@/db/sqlite";

export default async function Home() {
  // const result = await db.select().from(testeTable);
  // console.log(result);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"></main>
  );
}
