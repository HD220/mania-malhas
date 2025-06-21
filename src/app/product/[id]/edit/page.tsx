import { getProductWithImagesById, updateProduct } from "./actions";
import { ProductForm } from "@/components/forms/product-form";
import { InsertProductWithImages } from "@/db/repositories/schemas/productImageSchema";

export default async function Page({ params }: { params: { id: string } }) {
  const product = await getProductWithImagesById(params.id);

  if (!product) {
    // Consider using notFound() from next/navigation for better semantics
    throw new Error("Produto não encontrado!");
  }

  const handleFormSubmit = async (formData: InsertProductWithImages) => {
    // Extract the product ID from formData IF it exists, but prioritize params.id
    // The formData from useProductForm might still contain 'id' if it was in initialValues.
    const { id: formId, ...restOfData } = formData;

    // productIdFromUrl is params.id
    // dataFromForm is restOfData (which is Omit<InsertProductWithImages, 'id'>)
    // The server action updateProduct now expects (productIdFromUrl: string, dataFromForm: ProductUpdatePayload)
    // ProductUpdatePayload is essentially Omit<InsertProductWithImages, 'id'>
    await updateProduct(params.id, restOfData);
  };

  return (
    <div className="w-full mx-auto">
      {/* Type for initialValues in ProductForm is FormProduct (from useProductForm)
          which is compatible with SelectProductWithImages (structure of 'product') */}
      <ProductForm onSubmit={handleFormSubmit} initialValues={product as InsertProductWithImages} />
    </div>
  );
}
