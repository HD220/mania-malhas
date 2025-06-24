"use client";

import { SelectPayment } from "@/features/payment/schemas/paymentSchema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentListProps {
  payments: SelectPayment[];
  isLoading?: boolean;
}

export function PaymentList({ payments, isLoading }: PaymentListProps) {
  if (isLoading) {
    return <p>Carregando pagamentos...</p>; // Replace with a proper skeleton loader later
  }

  if (!payments || payments.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum pagamento registrado para esta transação.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            {/* Add more heads if needed, e.g., for actions like delete/edit */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{format(new Date(payment.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(payment.value))}
              </TableCell>
              {/* Add cells for actions */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
