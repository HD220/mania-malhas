"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ReactNode is part of NavbarItemProps, no separate import needed if only used for the type.
// import { ReactNode } from "react";

import { NavbarItemProps } from "@/lib/types/navigation.types";
import { cn } from "@/lib/utils";


export function NavbarItem({ href, label, icon }: NavbarItemProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        pathname.split("/")[1] == href.split("/")[1] && "text-primary"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
