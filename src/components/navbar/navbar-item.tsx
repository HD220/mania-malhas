import Link from "next/link";
import { ReactNode } from "react";

export type NavbarItemProps = {
  label: string;
  href: string;
  icon: ReactNode;
  className?: string;
};

export function NavbarItem({ href, label, icon }: NavbarItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
    >
      {icon}
      {label}
    </Link>
  );
}
