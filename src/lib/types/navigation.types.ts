import { ReactNode } from "react";

/**
 * Properties for a navigation bar item.
 */
export type NavbarItemProps = {
  label: string;
  href: string;
  icon: ReactNode;
  className?: string;
  // subItems?: NavbarItemProps[]; // Potential future enhancement
};
