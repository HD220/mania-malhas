"use client"; // Navigation links and potential future user menu might need client interactivity

import { Package2, UserCircle } from 'lucide-react'; // UserCircle as a placeholder icon
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function MainAppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Link
        href="/" // Assuming the main app's home/dashboard will be at the root of the (main_app) group, or adjust as needed
        className="flex items-center gap-2 text-lg font-semibold md:text-base mr-auto" // mr-auto to push nav and user menu to the right
      >
        <Package2 className="h-6 w-6" />
        <span className="sr-only">Mania Malhas</span>
        {/* Screen reader text, actual name can be visible or part of logo image later */}
         <span className="font-bold">Mania Malhas</span>
      </Link>

      <nav className="hidden md:flex items-center gap-5 text-sm lg:gap-6">
        <Link
          href="/product/list"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Produtos
        </Link>
        <Link
          href="/partner/list"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Parceiros
        </Link>
        <Link
          href="/receivable/list"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Recebíveis
        </Link>
        {/* Add other main navigation links here if needed */}
      </nav>

      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {/* Placeholder for potential mobile navigation toggle if nav items grow */}
        {/* <Sheet>...</Sheet> */}

        {/* User Menu Placeholder */}
        <div>
          {/* TODO: Implement User Dropdown Menu (integrates with auth, part of a future task) */}
          <Button variant="secondary" size="icon" className="rounded-full">
            <UserCircle className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
