"use client";

import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export default function Tab({
  status,
  actives,
  inactives,
}: {
  status?: string;
  actives?: ReactNode;
  inactives?: ReactNode;
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
            <Link href="/product/new">Novo</Link>
          </Button>
        </div>
      </div>
      <TabsContent value="active">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {actives}
        </div>
      </TabsContent>
      <TabsContent value="inactive">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {inactives}
        </div>
      </TabsContent>
    </Tabs>
  );
}
