import { createProduct } from "@/features/product/actions/new-product.action";
import { ProductForm } from "@/features/product/components/ProductForm";

export default function Page() {
  return (
    <div className="w-full mx-auto">
      <ProductForm
        onSubmit={createProduct}
        initialValues={{
          description: "",
          name: "",
          price: 0,
          active: true,
        }}
      />
    </div>
  );
}
