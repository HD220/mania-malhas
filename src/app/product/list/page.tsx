import { TabsContent } from "@/components/ui/tabs";
import { getProducts } from "./actions";
import Tab from "./tabs";
import { ProductCard } from "@/components/product-card";

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
