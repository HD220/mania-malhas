"use client";

import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatterPhoneNumber } from "@/utils";
import Link from "next/link";

export const columns: ColumnDef<SelectPartner>[] = [
  {
    accessorKey: "name",
    header: () => <span className="p-2">Nome</span>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-1 flex-col gap-1 p-2">
          <span>{row.original.name}</span>
          <span className="text-xs text-muted-foreground sm:hidden">
            {formatterPhoneNumber(row.original.phone || "")}
          </span>
          <span className="text-md text-muted-foreground sm:hidden">
            {row.original.notes}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => <span className="hidden sm:inline-block p-2">Telefone</span>,
    cell: (field) => {
      return (
        <span className="hidden sm:inline-block p-2">
          {formatterPhoneNumber(field.getValue() as string)}
        </span>
      );
    },
  },
  {
    accessorKey: "notes",
    header: () => <span className="hidden sm:inline-block p-2">Anotações</span>,
    cell: (field) => (
      <span className="hidden sm:inline-block p-2">
        {field.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "active",
    header: () => <span className="hidden sm:inline-block p-2">Status</span>,
    cell: (field) => {
      const value = field.getValue() as boolean;
      return (
        <span className="hidden sm:inline-block p-2">
          {value ? "Ativo" : "Inativo"}
        </span>
      );
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const partner = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 m-0 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" asChild>
              {/* <Button asChild size={"sm"}> */}
              <Link href={`/partner/${partner.id}/edit`}>Editar</Link>
              {/* </Button> */}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
