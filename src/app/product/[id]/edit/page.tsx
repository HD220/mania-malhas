import { getProductWithImagesById, updateProduct } from "./actions";
import { ProductForm } from "@/components/forms/product-form";

export default async function Page({ params }: { params: { id: number } }) {
  const product = await getProductWithImagesById(params.id);

  return (
    <div className="w-full mx-auto">
      <ProductForm onSubmit={updateProduct} initialValues={product} />
    </div>
  );
}
