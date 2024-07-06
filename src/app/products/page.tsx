import { ProductCard } from "@/components/product-card";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProducts } from "./actions";

export default async function Page() {
  const products = await getProducts();

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
