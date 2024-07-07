"use client";

import { cn } from "@/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export type NavbarItemProps = {
  label: string;
  href: string;
  icon: ReactNode;
  className?: string;
};

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
