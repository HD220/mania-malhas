"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentForm, PaymentFormData } from "@/components/forms/payment-form";
import { PaymentList } from "@/components/payment-list";
import { addPaymentAction, listPaymentsByTransactionAction, PaymentServerResponse } from "@/app/payment/actions"; // Adjust path as needed
import { SelectPayment } from "@/db/repositories/schemas/paymentSchema";
import { useToast } from "./ui/use-toast";

interface TransactionPaymentsModalProps {
  transactionId: string | null; // Null when modal is closed
  transactionValue: number; // Total value of the transaction
  transactionType: "E" | "S"; // Entry or Exit
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded?: () => void; // Callback to refresh transaction list or details
}

export function TransactionPaymentsModal({
  transactionId,
  transactionValue,
  transactionType,
  open,
  onOpenChange,
  onPaymentAdded,
}: TransactionPaymentsModalProps) {
  const [payments, setPayments] = useState<SelectPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    if (!transactionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await listPaymentsByTransactionAction(transactionId);
      if (response.success && response.data) {
        setPayments(response.data as SelectPayment[]);
      } else {
        setError(response.message || "Falha ao buscar pagamentos.");
        setPayments([]);
      }
    } catch (e) {
      setError((e as Error).message || "Erro ao conectar.");
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (open && transactionId) {
      fetchPayments();
    }
  }, [open, transactionId, fetchPayments]);

  const handleAddPayment = async (data: PaymentFormData & { transactionId: string }): Promise<PaymentServerResponse<{id: string}>> => {
    const result = await addPaymentAction(data);
    if (result.success) {
      fetchPayments(); // Refresh list
      if (onPaymentAdded) onPaymentAdded(); // Notify parent to refresh
    }
    return result; // Return result for PaymentForm to handle specific error messages
  };

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.value), 0);
  const remainingBalance = Number(transactionValue) - totalPaid;
  const canAddMorePayments = remainingBalance > 0.001 || transactionType === 'E'; // Allow overpayment for Entries if desired, for now, same logic.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Pagamentos da Transação</DialogTitle>
          <DialogDescription>
            ID da Transação: {transactionId || "N/A"} <br />
            Valor Total: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(transactionValue)} <br />
            Total Pago: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPaid)} <br />
            Saldo Devedor: <span className={remainingBalance <= 0.001 ? "text-green-600" : "text-red-600"}>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(remainingBalance)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Adicionar Novo Pagamento</h4>
            {canAddMorePayments ? (
                 <PaymentForm
                    transactionId={transactionId!} // Should be valid if modal is open
                    onSubmit={handleAddPayment}
                    // onSuccess={fetchPayments} // Already handled by handleAddPayment
                    disabled={!transactionId || !canAddMorePayments}
                  />
            ) : (
                <p className="text-sm text-green-600">Esta transação já foi totalmente paga.</p>
            )}

          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Histórico de Pagamentos</h4>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <PaymentList payments={payments} isLoading={isLoading} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
