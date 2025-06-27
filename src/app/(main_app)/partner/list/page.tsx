import { DataTable } from "@/components/ui/data-table";
import { getPartners } from "@/features/partner/actions";

import { columns } from "./columns";
import { TabsPartner } from "./tabs"; // Corrected import name

export default async function Page({
  searchParams: { search = "", status = "active" },
}: {
  searchParams: { search?: string; status?: string };
}) {
  const [actives, inactives] = await Promise.all([
    getPartners(search, true),
    getPartners(search, false),
  ]);

  return (
    <div className="flex flex-col gap-2">
      <TabsPartner // Corrected usage
        status={status}
        actives={<DataTable columns={columns} data={actives} />}
        inactives={<DataTable columns={columns} data={inactives} />}
      />
    </div>
  );
}
