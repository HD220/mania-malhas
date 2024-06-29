import { NavbarItemProps } from "@/components/navbar/navbar-item";
import { Package, Package2, Users } from "lucide-react";

const menus: NavbarItemProps[] = [
  {
    label: "Mania Malhas",
    href: "/",
    icon: <Package2 className="h-5 w-5" />,
  },
  {
    label: "Produtos",
    href: "/products",
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: "Clientes",
    href: "/parters",
    icon: <Users className="h-5 w-5" />,
  },
];

export default menus;
