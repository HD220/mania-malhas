import { IconProps } from "../icon";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { NavbarItem, NavbarItemProps } from "./navbar-item";

export type NavbarProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  menus: NavbarItemProps[];
};

export function Navbar({ className, menus, ...props }: NavbarProps) {
  return (
    <nav className={cn("grid gap-2 text-lg font-medium", className)} {...props}>
      {menus.map((menu, index) => (
        <NavbarItem key={index} {...menu} />
      ))}
    </nav>
  );
}
