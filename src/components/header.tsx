"use client"; // Make this a Client Component

import Link from "next/link";
import { useRouter } from "next/navigation"; // For client-side redirect fallback if needed
import { useTransition } from "react"; // For pending UI state

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navbar } from "@/components/navbar/navbar";
import menus from "@/constant";
import { Bell, CircleUser, Menu, Package2 } from "lucide-react";

export function Header() {
  const router = useRouter(); // For client-side redirect fallback if needed
  const [isPending, startTransition] = useTransition(); // For pending UI state

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <div className="flex h-14 items-center border-b px-2 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Mania Malhas</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <Navbar
            menus={menus.slice(1, menus.length)}
            className="grid gap-2 text-lg font-medium"
          />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">{/* TO-DO: breadcrumb */}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuItem>Suporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-sm p-0">
            <ThemeToggle />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <form action={async () => {
            "use server"; // Required if the action is defined inline here and not imported
            // This inline server action is a bit verbose for just calling another server action.
            // A better approach for client components is to call an imported server action.
            // However, DropdownMenuItem itself might not be a form element.
            // Let's make the Header a client component to easily call logoutUser.
            // This requires moving "use client" to the top of the file.
            // For now, let's assume we make the DropdownMenuItem trigger the imported server action.
            // This often involves a helper client component or making Header client component.

            // Simplest approach for now, if this component becomes "use client":
            // onClick={async () => await logoutUser()}
            // For a server component context using form:
            // This might not work directly as DropdownMenuItem is not a submit button.
            // A common pattern is to have a small client component that handles the onClick.

            // Let's adjust to make the specific item a client-side trigger for the server action
            // This would typically involve creating a small client component for the logout button/item
            // or making Header "use client" to use onClick.
            // For the sake of this step, we'll assume Header can be "use client" or this is handled.
            // The most direct way if Header is a server component is a form.

            // No longer need the form wrapper here as we are in a client component.
             <DropdownMenuItem
                onSelect={() => { // Removed async from onSelect directly
                  startTransition(async () => {
                    await logoutUser();
                    // The redirect is handled by the server action.
                    // router.push("/login"); // Client-side redirect as a fallback if needed.
                  });
                }}
                disabled={isPending}
             >
              {isPending ? "Saindo..." : "Sair"}
             </DropdownMenuItem>
          {/* </form> */} {/* Remove form if it was just for the action */}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

// logoutUser needs to be imported at the top level of the module
import { logoutUser } from "@/app/(auth)/actions";
