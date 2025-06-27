import { notFound } from "next/navigation";

import { ProductForm } from "@/features/product/components/ProductForm";
import { getProductWithImagesById, updateProduct } from "@/features/product/actions/edit-product.action";

export default async function Page({ params }: { params: { id: string } }) {
  const product = await getProductWithImagesById(params.id);

  if (!product) {
    notFound(); // Chamar notFound se o produto não existir
  }

  return (
    <div className="w-full mx-auto">
      <ProductForm onSubmit={updateProduct} initialValues={product} />
    </div>
  );
}
