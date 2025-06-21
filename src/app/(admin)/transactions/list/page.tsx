"use client"; // Esta página agora precisa ser um Client Component para usar hooks de estado

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense, useEffect, useState, useCallback } from "react";
import { listTransactionsAction } from "./actions"; // Ajuste o caminho se necessário
import { SelectTransaction } from "@/db/repositories/schemas/transactionSchema";
import { TransactionPaymentsModal } from "@/components/transaction-payments-modal"; // Ajuste o caminho se necessário
import { useToast } from "@/components/ui/use-toast";

// Componente da Tabela de Transações
function TransactionsTable({
  transactions,
  onViewPaymentsClick
}: {
  transactions: SelectTransaction[];
  onViewPaymentsClick: (transaction: SelectTransaction) => void;
}) {
  if (!transactions || transactions.length === 0) {
    return <p>Nenhuma transação encontrada.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parceiro</th> */}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(transaction.value as any))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type === 'E' ? 'Entrada' : 'Saída'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.status}</td>
              {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.partnerId}</td>  // TODO: Buscar nome do parceiro */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.DateTimeFormat("pt-BR").format(new Date(transaction.date))}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button variant="outline" size="sm" onClick={() => onViewPaymentsClick(transaction)}>Ver Pagamentos</Button>
                {/* Adicionar mais ações como editar, excluir */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TransactionsListPage() {
  const [transactions, setTransactions] = useState<SelectTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedTransaction, setSelectedTransaction] = useState<SelectTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listTransactionsAction(); // TODO: Adicionar filtros aqui
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setError(response.message || "Falha ao carregar transações.");
        toast({ variant: "destructive", title: "Erro", description: response.message });
      }
    } catch (e: any) {
      const errorMessage = e.message || "Erro desconhecido ao carregar transações.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Erro de Conexão", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleViewPayments = (transaction: SelectTransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedTransaction(null);
    }
  };

  const handlePaymentAdded = () => {
    // Re-fetch transactions to update their status or payment-related info if necessary
    loadTransactions();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas transações financeiras.
            {/* TODO: Adicionar botão para Nova Transação aqui */}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* TODO: Adicionar Filtros aqui */}
          <div>Filtros: (Em breve)</div>
          {isLoading && <p>Carregando transações...</p>}
          {error && <p className="text-destructive">Erro: {error}</p>}
          {!isLoading && !error && (
            <TransactionsTable transactions={transactions} onViewPaymentsClick={handleViewPayments} />
          )}
        </CardContent>
        <CardFooter>
          {/* TODO: Adicionar Paginação aqui */}
          <div>Paginação: (Em breve)</div>
        </CardFooter>
      </Card>

      {selectedTransaction && (
        <TransactionPaymentsModal
          transactionId={selectedTransaction.id}
          transactionValue={parseFloat(selectedTransaction.value as any)}
          transactionType={selectedTransaction.type as "E" | "S"}
          open={isModalOpen}
          onOpenChange={handleModalOpenChange}
          onPaymentAdded={handlePaymentAdded}
        />
      )}
    </div>
  );
}
