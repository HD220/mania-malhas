import { HandCoins, Package, Package2, Users } from "lucide-react";

import { NavbarItemProps } from "@/lib/types/navigation.types";

const menus: NavbarItemProps[] = [
  {
    label: "Mania Malhas",
    href: "/",
    icon: "icon_placeholder", // Temporary string
  },
  {
    label: "Contas a Receber",
    href: "/receivable/list",
    icon: "icon_placeholder", // Temporary string
  },
  {
    label: "Produtos",
    href: "/product/list",
    icon: "icon_placeholder", // Temporary string
  },
  {
    label: "Clientes",
    href: "/partner/list",
    icon: "icon_placeholder", // Temporary string
  },
];

export default menus;
