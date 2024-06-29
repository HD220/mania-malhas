import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar/navbar";
import menus from "@/constant";
import { Bell, Package2 } from "lucide-react";

export default function AsideBar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span className="">Mania Malhas</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>
        <div className="flex-1">
          <Navbar
            menus={menus.slice(1, menus.length)}
            className="grid items-start px-2 text-sm font-medium lg:px-4"
          />
        </div>
        <div className="mt-auto p-4"></div>
      </div>
    </div>
  );
}
