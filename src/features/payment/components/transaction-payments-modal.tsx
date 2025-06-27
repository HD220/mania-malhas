"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import { addPaymentAction, listPaymentsByTransactionAction, PaymentServerResponse } from "@/features/payment/actions";
import { PaymentForm, PaymentFormData } from "@/features/payment/components/payment-form";
import { PaymentList } from "@/features/payment/components/payment-list";
import { SelectPayment } from "@/features/payment/schemas/payment.schema";

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
      // listPaymentsByTransactionAction now correctly typed to return PaymentServerResponse<SelectPayment[]>
      const response = await listPaymentsByTransactionAction(transactionId);
      if (response.success && response.data) {
        setPayments(response.data); // No need for 'as SelectPayment[]' if action is correctly typed
      } else {
        setError(response.message || "Falha ao buscar pagamentos.");
        setPayments([]);
        toast({ variant: "destructive", title: "Erro ao buscar pagamentos", description: response.message });
      }
    } catch (e: any) {
      const errorMessage = (e instanceof Error ? e.message : String(e)) || "Erro ao conectar.";
      setError(errorMessage);
      setPayments([]);
      toast({ variant: "destructive", title: "Erro de Conexão", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [transactionId, toast]); // Added toast to dependency array

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
    // PaymentForm will show specific toasts based on the result
    return result;
  };

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.value as unknown as string), 0); // Ensure p.value is treated as number
  const remainingBalance = parseFloat(transactionValue as unknown as string) - totalPaid;

  // Do not allow adding more payments if the transaction is fully paid or overpaid.
  // A small tolerance (e.g., 0.001) can be used for floating point comparisons.
  const canAddMorePayments = remainingBalance > 0.001;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Pagamentos da Transação</DialogTitle>
          <DialogDescription>
            ID da Transação: {transactionId || "N/A"} <br />
            Valor Total: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(transactionValue)} <br />
            Total Pago: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPaid)} <br />
            Saldo Devedor: <span
              data-testid="remaining-balance"
              className={remainingBalance <= 0.001 ? "text-green-600" : "text-red-600"}
            >
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
