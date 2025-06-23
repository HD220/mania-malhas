"use client";

import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
            <Link href="/partner/new">Novo</Link>
          </Button>
        </div>
      </div>
      <TabsContent value="active">
        <div className="flex flex-1 rounded-md border">
          <ScrollArea className="w-full inline-grid">
            {actives}
            <ScrollBar orientation={"horizontal"} />
          </ScrollArea>
        </div>
      </TabsContent>
      <TabsContent value="inactive">
        <div className="flex flex-1 rounded-md border">
          <ScrollArea className="w-full inline-grid">
            {inactives}
            <ScrollBar orientation={"horizontal"} />
          </ScrollArea>
        </div>
      </TabsContent>
    </Tabs>
  );
}
