import { ProductCard } from "@/components/product-card";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import { db } from "@/db/postgres";
import { productTable } from "@/db/postgres/schema/product";
import { productImageTable } from "@/db/postgres/schema/productImage";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function Page() {
  const products = await db
    .select({
      id: productTable.id,
    })
    .from(productTable);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-1 justify-end gap-2">
        <Search className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3" />
        <Button asChild>
          <Link href="/product/new">Novo</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
