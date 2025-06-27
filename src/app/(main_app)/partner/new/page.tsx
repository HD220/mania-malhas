import { PartnerForm } from "@/features/partner/components/partner-form/partner-form";
import { createPartner } from "@/features/partner/actions";
// Order corrected: components before actions if following a more granular internal ordering.
// The eslintrc groups all @/features together, so this might not be strictly necessary
// but is good practice.

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
