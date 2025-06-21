import { getPartnerById, updatePartner } from "./actions";
import { PartnerForm } from "@/components/forms/partner-form";
import { notFound } from "next/navigation"; // Importar notFound

export default async function Page({ params }: { params: { id: string } }) {
  const partner = await getPartnerById(params.id); // Corrigido nome da variável

  if (!partner) {
    notFound(); // Chamar notFound se o parceiro não existir
  }

  return (
    <div className="w-full mx-auto">
      <PartnerForm onSubmit={updatePartner} initialValues={partner} />
    </div>
  );
}
