import { notFound } from "next/navigation"; // Importar notFound

import { PartnerForm } from "@/features/partner/components/partner-form/partner-form";
import { getPartnerById, updatePartner } from "@/features/partner/actions"; // Corrected: actions should be after components if following external -> internal -> relative
// However, the eslintrc seems to group all @/features together. Let's try this.
// If specific order is needed between @/features/components and @/features/actions, it would be a more specific rule.

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
