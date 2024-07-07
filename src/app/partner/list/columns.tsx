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

export const columns: ColumnDef<SelectPartner>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
  {
    accessorKey: "notes",
    header: "Anotações",
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: (field) => {
      const value = field.getValue();
      return value ? "Ativo" : "Inativo";
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(partner.id)}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => navigator.clipboard.writeText(partner.id)}
            >
              Inativar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
