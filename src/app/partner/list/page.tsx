import { getPartners } from "./actions";
import Tab from "./tabs";

export default async function Page({
  searchParams: { search = "", status = "active" },
}: {
  searchParams: { search?: string; status?: string };
}) {
  const partners = await getPartners(search, status === "active");

  return (
    <div className="flex flex-col gap-2">
      <Tab status={status}>
        <p>TODO!</p>
      </Tab>
    </div>
  );
}
