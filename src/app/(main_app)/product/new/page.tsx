import { ProductForm } from "@/components/forms/product-form";
import { createProduct } from "@/features/product/actions/newProductActions";

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
