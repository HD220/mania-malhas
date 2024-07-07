import { PartnerForm } from "@/components/forms/partner-form";
import { createPartner } from "./actions";

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
