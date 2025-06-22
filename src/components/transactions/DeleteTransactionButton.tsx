"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";
import { deleteTransactionAction } from "@/app/(admin)/transactions/actions"; // Import the server action
import { toast } from "sonner"; // Import toast
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
  transactionDescription?: string; // Optional: for a more specific message
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
      setIsDialogOpen(false); // Close dialog regardless of outcome
    });
  };

  const descriptionText = transactionDescription // Renamed to avoid conflict
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
