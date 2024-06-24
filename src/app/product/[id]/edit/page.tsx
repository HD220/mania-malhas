import { ProductForm } from "@/components/forms/product-form";

type PageProps = {
  params: { id: string };
};

export default function Page({ params }: PageProps) {
  return (
    <div className="w-full mx-auto">
      <ProductForm initialValues={{}} />
    </div>
  );
}
