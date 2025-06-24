import { getProductWithImagesById, updateProduct } from "@/features/product/actions/editProductActions";
import { ProductForm } from "@/components/forms/product-form";
import { notFound } from "next/navigation"; // Importar notFound

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
