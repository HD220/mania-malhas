import { getProductWithImagesById, updateProduct } from "./actions";
import { ProductForm } from "@/components/forms/product-form";

export default async function Page({ params }: { params: { id: string } }) {
  const product = await getProductWithImagesById(params.id);

  if (!product) throw new Error("Produto não encontado!");

  return (
    <div className="w-full mx-auto">
      <ProductForm onSubmit={updateProduct} initialValues={product} />
    </div>
  );
}
