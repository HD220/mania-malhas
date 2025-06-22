"use client";

import * as React from "react";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onConfirmDelete: () => void; // Placeholder for now, will call server action in next task
}

export function DeleteTransactionButton({
  transactionId,
  transactionDescription,
  onConfirmDelete,
}: DeleteTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteConfirm = () => {
    // console.log(`Confirmed deletion for transaction ID: ${transactionId}`);
    onConfirmDelete(); // This will be wired to the actual action call later
    setIsDialogOpen(false); // Close dialog after confirmation
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
          <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            // Consider adding a more destructive variant style if available/desired
            // e.g., className="bg-red-600 hover:bg-red-700"
          >
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
