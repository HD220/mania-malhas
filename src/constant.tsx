import { NavbarItemProps } from "@/components/navbar/navbar-item";
import { HandCoins, Package, Package2, Users } from "lucide-react";

const menus: NavbarItemProps[] = [
  {
    label: "Mania Malhas",
    href: "/",
    icon: <Package2 className="h-5 w-5" />,
  },
  {
    label: "Contas a Receber",
    href: "/receivable/list",
    icon: <HandCoins className="h-5 w-5" />,
  },
  {
    label: "Produtos",
    href: "/product/list",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Clientes",
    href: "/partner/list",
    icon: <Users className="h-5 w-5" />,
  },
];

export default menus;
