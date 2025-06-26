import { PartnerForm } from "@/features/partner/components/partner-form/partner-form";
import { createPartner } from "@/features/partner/actions";

export default function Page() {
  return (
    <div className="w-full mx-auto">
      <PartnerForm
        onSubmit={createPartner}
        initialValues={{
          notes: "",
          name: "",
          phone: "",
          active: true,
        }}
      />
    </div>
  );
}
