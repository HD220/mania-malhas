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

import { CalendarIcon } from "lucide-react"; // Importar CalendarIcon
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Para DatePicker
import { Calendar } from "@/components/ui/calendar"; // Para DatePicker
import { format, isValid as isValidDate } from "date-fns"; // Para formatar datas e verificar validade
import { ptBR } from "date-fns/locale"; // Para locale pt-BR
import { cn } from "@/utils"; // Para classnames condicionais

// Tipos de Filtro
interface TransactionFilters {
  type?: "E" | "S"; // Removido "all" pois undefined representa "all"
  status?: string; // Removido "all"
  dateFrom?: Date;
  dateTo?: Date;
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

  const [filters, setFilters] = useState<TransactionFilters>({}); // Inicializar filtros vazios
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  /**
   * Handles changes in filter selection for string-based filters (type, status).
   * Resets to page 1 when these filters change.
   */
  const handleSelectFilterChange = (filterName: "type" | "status", value: string) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      [filterName]: value === "all" ? undefined : value
    }));
  };

  /**
   * Handles changes in date filter selection.
   * Resets to page 1 when date filters change.
   */
  const handleDateFilterChange = (filterName: "dateFrom" | "dateTo", date?: Date) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      [filterName]: date,
    }));
  };

  /**
   * Fetches transactions from the server based on the current filter and pagination state.
   * Updates component state for transactions, loading status, errors, and pagination info.
   */
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // activeFilters agora pode conter dateFrom e dateTo, que serão passados para a action
      const activeFilters: Partial<TransactionFilters> = { ...filters };
      // Remover chaves 'all' se existirem (embora o state já deva ter undefined)
      if (activeFilters.type === "all") delete activeFilters.type;
      if (activeFilters.status === "all") delete activeFilters.status;

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
          <div className="flex flex-wrap items-end gap-4 mb-4"> {/* Usar flex-wrap para melhor responsividade */}
            <div className="grid gap-1.5">
              <Label htmlFor="filter-type">Tipo</Label>
              <Select
                value={filters.type || "all"} // "all" para corresponder ao SelectItem
                onValueChange={(value) => handleSelectFilterChange("type", value as "E" | "S" | "all")}
              >
                <SelectTrigger id="filter-type" className="w-full min-w-[150px] sm:w-auto">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="E">Entrada</SelectItem>
                  <SelectItem value="S">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filters.status || "all"} // "all" para corresponder ao SelectItem
                onValueChange={(value) => handleSelectFilterChange("type", value as "E" | "S" | "all")}
              >
                <SelectTrigger id="filter-status" className="w-full min-w-[150px] sm:w-auto">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-dateFrom">Data De</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="filter-dateFrom"
                    variant={"outline"}
                    className={cn(
                      "w-full min-w-[180px] sm:w-auto justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom && isValidDate(filters.dateFrom) ? format(filters.dateFrom, "dd/MM/yyyy", { locale: ptBR }) : <span>De</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => handleDateFilterChange("dateFrom", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-dateTo">Data Até</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="filter-dateTo"
                    variant={"outline"}
                    className={cn(
                      "w-full min-w-[180px] sm:w-auto justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo && isValidDate(filters.dateTo) ? format(filters.dateTo, "dd/MM/yyyy", { locale: ptBR }) : <span>Até</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleDateFilterChange("dateTo", date)}
                    disabled={(date) =>
                      filters.dateFrom ? date < filters.dateFrom : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
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
