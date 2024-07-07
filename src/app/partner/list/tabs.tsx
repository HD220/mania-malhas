"use client";

import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export default function Tab({
  status,
  children,
}: {
  status?: string;
  children?: ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  return (
    <Tabs
      defaultValue={status === "active" ? "active" : "inactive"}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);
        if (value !== "active") {
          params.set("status", value);
        } else {
          params.delete("status");
        }

        replace(`${pathname}?${params.toString()}`);
      }}
    >
      <div className="flex flex-1 justify-between gap-2">
        <TabsList>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>
        <div className="flex gap-2">
          <Search className="flex" />
          <Button asChild>
            <Link href="/partner/new">Novo</Link>
          </Button>
        </div>
      </div>
      <TabsContent value={status === "active" ? "active" : "inactive"}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {children}
        </div>
      </TabsContent>
    </Tabs>
  );
}
