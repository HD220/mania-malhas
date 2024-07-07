import { getProducts } from "./actions";
import Tab from "./tabs";

export default async function Page({
  searchParams: { search = "", status = "active" },
}: {
  searchParams: { search?: string; status?: string };
}) {
  const products = await getProducts(search, status === "active");

  return (
    <div className="flex flex-col gap-2">
      <Tab products={products} status={status} />
    </div>
  );
}
