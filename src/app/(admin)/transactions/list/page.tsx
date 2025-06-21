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
import { listTransactionsAction } from "./actions";
import { TransactionWithPartner } from "@/db/repositories/transactionRepository";
import { TransactionPaymentsModal } from "@/components/transaction-payments-modal";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Para filtros
import { Label } from "@/components/ui/label";

// Tipos de Filtro
interface TransactionFilters {
  type?: "E" | "S" | "all";
  status?: string | "all"; // Ex: "Pendente", "Pago", "Cancelado"
}

// Componente da Tabela de Transações
function TransactionsTable({
  transactions,
  onViewPaymentsClick
}: {
  transactions: TransactionWithPartner[]; // Atualizado para TransactionWithPartner
  onViewPaymentsClick: (transaction: TransactionWithPartner) => void; // Atualizado para TransactionWithPartner
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parceiro</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.partnerName || transaction.partnerId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(transaction.value as any))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type === 'E' ? 'Entrada' : 'Saída'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.status}</td>
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
  const [transactions, setTransactions] = useState<TransactionWithPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithPartner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<TransactionFilters>({ type: "all", status: "all" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // const [totalItems, setTotalItems] = useState(0); // totalItems é usado para calcular totalPages, mas não precisa ser estado separado se totalPages for o principal
  const pageSize = 10; // Itens por página

  /**
   * Handles changes in filter selection.
   * Resets to page 1 when filters change.
   * Updates the `filters` state, setting a filter to `undefined` if "all" is selected.
   * @param filterName The name of the filter being changed (e.g., "type", "status").
   * @param value The new value of the filter.
   */
  const handleFilterChange = (filterName: keyof TransactionFilters, value: string) => {
    setCurrentPage(1); // Reset page to 1 when filters change
    setFilters(prev => ({ ...prev, [filterName]: value === "all" ? undefined : value }));
  };

  /**
   * Fetches transactions from the server based on the current filter and pagination state.
   * Updates component state for transactions, loading status, errors, and pagination info.
   */
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters: Partial<TransactionFilters> = {};
      if (filters.type && filters.type !== "all") activeFilters.type = filters.type;
      if (filters.status && filters.status !== "all") activeFilters.status = filters.status;

      const response = await listTransactionsAction(activeFilters, { page: currentPage, pageSize });

      if (response.success && response.data) {
        setTransactions(response.data.data);
        // setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
        // Não definir currentPage aqui, pois ele é a fonte da verdade para a chamada da action
      } else {
        setError(response.message || "Falha ao carregar transações.");
        toast({ variant: "destructive", title: "Erro", description: response.message });
        setTransactions([]);
        // setTotalItems(0);
        setTotalPages(0);
      }
    } catch (e: any) {
      const errorMessage = e.message || "Erro desconhecido ao carregar transações.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Erro de Conexão", description: errorMessage });
      setTransactions([]);
      // setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast, filters, currentPage, pageSize]); // `filters` e `currentPage` são dependências chave

  // useEffect para carregar transações na montagem inicial e quando filtros ou página atual mudam.
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]); // loadTransactions já tem `filters` e `currentPage` como dependências no seu useCallback

  /**
   * Sets the selected transaction and opens the payments modal.
   * @param transaction The transaction object for which to view payments.
   */
  const handleViewPayments = (transaction: TransactionWithPartner) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  /**
   * Handles the open state change of the payments modal.
   * Clears the selected transaction when the modal is closed.
   * @param open The new open state of the modal.
   */
  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedTransaction(null);
    }
  };

  /**
   * Callback function triggered when a payment is successfully added via the modal.
   * Reloads the transactions list to reflect any changes (e.g., updated status or payment totals).
   */
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="filter-type">Tipo</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger id="filter-type" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Todos os Tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="E">Entrada</SelectItem>
                  <SelectItem value="S">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger id="filter-status" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  {/* Adicionar outros status se houver */}
                </SelectContent>
              </Select>
            </div>
            {/* <Button onClick={loadTransactions} disabled={isLoading}>Aplicar Filtros</Button> */}
            {/* Os filtros são aplicados automaticamente via useEffect no `filters` */}
          </div>
          {isLoading && <p>Carregando transações...</p>}
          {error && <p className="text-destructive">Erro: {error}</p>}
          {!isLoading && !error && (
            <TransactionsTable transactions={transactions} onViewPaymentsClick={handleViewPayments} />
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || isLoading}
            >
              Próxima
            </Button>
          </div>
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
