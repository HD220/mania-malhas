"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTransactionAction } from "@/features/transaction/actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteTransactionButtonProps {
  transactionId: string;
  transactionDescription?: string;
}

export function DeleteTransactionButton({
  transactionId,
  transactionDescription,
}: DeleteTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDeleteConfirm = async () => {
    startTransition(async () => {
      const response = await deleteTransactionAction(transactionId);
      if (response.success) {
        toast.success(response.message || "Transação excluída com sucesso.");
      } else {
        toast.error(response.message || "Falha ao excluir transação.");
      }
      setIsDialogOpen(false);
    });
  };

  const description = transactionDescription
    ? `Tem certeza que deseja excluir a transação "${transactionDescription}"? Esta ação não pode ser desfeita.`
    : "Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.";

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Excluir Transação</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsDialogOpen(false)} disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
