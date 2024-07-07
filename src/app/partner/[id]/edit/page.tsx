import { getPartnerById, updatePartner } from "./actions";
import { PartnerForm } from "@/components/forms/partner-form";

export default async function Page({ params }: { params: { id: string } }) {
  const product = await getPartnerById(params.id);

  if (!product) throw new Error("Cliente não encontado!");

  return (
    <div className="w-full mx-auto">
      <PartnerForm onSubmit={updatePartner} initialValues={product} />
    </div>
  );
}
