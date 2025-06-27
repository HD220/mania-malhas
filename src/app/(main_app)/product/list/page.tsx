// TabsContent is not directly used, it's part of the Tab component from ./tabs
// import { TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/features/product/components/product-card";
import { getProducts } from "@/features/product/actions/list-products.action";

import Tab from "./tabs"; // Local component

export default async function Page({
  searchParams: { search = "", status = "active" },
}: {
  searchParams: { search?: string; status?: string };
}) {
  const [actives, inactives] = await Promise.all([
    getProducts(search, true),
    getProducts(search, false),
  ]);

  return (
    <div className="flex flex-col gap-2">
      <Tab
        status={status}
        actives={actives.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
        inactives={inactives.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      />
    </div>
  );
}
