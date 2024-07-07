import { DataTable } from "@/components/ui/data-table";
import { getPartners } from "./actions";
import { columns } from "./columns";
import Tab from "./tabs";

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
      <Tab
        status={status}
        actives={<DataTable columns={columns} data={actives} />}
        inactives={<DataTable columns={columns} data={inactives} />}
      />
    </div>
  );
}
