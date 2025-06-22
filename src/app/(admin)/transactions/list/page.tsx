"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { listTransactionsAction } from "./actions";
import { TransactionWithPartner } from "@/db/repositories/transactionRepository";
import { TransactionPaymentsModal } from "@/components/transaction-payments-modal";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid as isValidDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/utils";
import { UseCaseOrderByParams } from "@/usecases/transaction/getTransactionsUseCase"; // Importar o tipo

interface TransactionFilters {
  type?: "E" | "S";
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  partnerId?: string;
}

/**
 * Defines which columns of the transaction table are sortable.
 */
type SortableColumn = keyof Pick<TransactionWithPartner, "date" | "value" | "status" | "description" | "type">;
interface SortConfig {
  column: SortableColumn;
  direction: "asc" | "desc";
}

/**
 * Renders the table of transactions.
 *
 * @param transactions - Array of transactions to display.
 * @param onViewPaymentsClick - Callback function when "Ver Pagamentos" is clicked.
 * @param sortConfig - Current sort configuration.
 * @param onSort - Callback function to handle sorting when a column header is clicked.
 */
function TransactionsTable({
  transactions,
  onViewPaymentsClick,
  sortConfig,
  onSort,
}: {
  transactions: TransactionWithPartner[];
  onViewPaymentsClick: (transaction: TransactionWithPartner) => void;
  sortConfig: SortConfig; // Non-null
  onSort: (column: SortableColumn) => void;
}) {
  if (!transactions || transactions.length === 0) {
    return <p>Nenhuma transação encontrada.</p>;
  }

  const renderSortIcon = (column: SortableColumn) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/70" />;
    }
    return sortConfig.direction === "asc" ?
      <ArrowUp className="ml-2 h-3 w-3" /> :
      <ArrowDown className="ml-2 h-3 w-3" />;
  };

  const thClassName = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100";
  const thActionClassName = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className={thClassName} onClick={() => onSort("description")}>
              <div className="flex items-center">Descrição {renderSortIcon("description")}</div>
            </th>
            <th scope="col" className={thActionClassName}>Parceiro</th>
            <th scope="col" className={thClassName} onClick={() => onSort("value")}>
              <div className="flex items-center">Valor {renderSortIcon("value")}</div>
            </th>
            <th scope="col" className={thClassName} onClick={() => onSort("type")}>
              <div className="flex items-center">Tipo {renderSortIcon("type")}</div>
            </th>
            <th scope="col" className={thClassName} onClick={() => onSort("status")}>
              <div className="flex items-center">Status {renderSortIcon("status")}</div>
            </th>
            <th scope="col" className={thClassName} onClick={() => onSort("date")}>
             <div className="flex items-center">Data {renderSortIcon("date")}</div>
            </th>
            <th scope="col" className={thActionClassName}>Ações</th>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * `TransactionsListPage` is a client component responsible for displaying a list
 * of transactions with filtering, sorting, and pagination capabilities.
 * It allows users to view payments for each transaction via a modal.
 */
export default function TransactionsListPage() {
  // State for storing the list of transactions
  const [transactions, setTransactions] = useState<TransactionWithPartner[]>([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State for storing any error messages during data fetching
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // State for the currently selected transaction to view payments
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithPartner | null>(null);
  // State to control the visibility of the payments modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for applied filters (type, status, dateFrom, dateTo)
  const [filters, setFilters] = useState<TransactionFilters>({});
  // State for the current page in pagination
  const [currentPage, setCurrentPage] = useState(1);
  // State for the total number of pages based on filters and pageSize
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10; // Number of items per page
  // State for the current sort configuration (column and direction)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: "date", direction: "desc" });

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSelectFilterChange = (filterName: "type" | "status", value: string) => {
    handleFilterChange({ [filterName]: value === "all" ? undefined : value as "E" | "S" | undefined });
  };

  const handleDateFilterChange = (filterName: "dateFrom" | "dateTo", date?: Date) => {
    handleFilterChange({ [filterName]: date });
  };

  const handleSort = (column: SortableColumn) => {
    setCurrentPage(1);
    setSortConfig(prevSortConfig => {
      if (prevSortConfig.column === column) {
        return { column, direction: prevSortConfig.direction === "asc" ? "desc" : "asc" };
      }
      return { column, direction: "desc" };
    });
  };

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters: Partial<TransactionFilters> = { ...filters };
      // Assegurar que "all" não é enviado para o backend
      if ((activeFilters.type as unknown) === "all") delete activeFilters.type;
      if ((activeFilters.status as unknown) === "all") delete activeFilters.status;

      const orderByForAction: UseCaseOrderByParams | undefined = sortConfig
        ? { column: sortConfig.column, direction: sortConfig.direction }
        : undefined;

      const response = await listTransactionsAction(activeFilters, { page: currentPage, pageSize }, orderByForAction);

      if (response.success && response.data) {
        setTransactions(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || "Falha ao carregar transações.");
        toast({ variant: "destructive", title: "Erro", description: response.message });
        setTransactions([]);
        setTotalPages(0);
      }
    } catch (e: any) {
      const errorMessage = e.message || "Erro desconhecido ao carregar transações.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Erro de Conexão", description: errorMessage });
      setTransactions([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast, filters, currentPage, pageSize, sortConfig]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleViewPayments = (transaction: TransactionWithPartner) => {
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
    loadTransactions();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas transações financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4 mb-4">
            <div className="grid gap-1.5">
              <Label htmlFor="filter-type">Tipo</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => handleSelectFilterChange("type", value)}
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
                value={filters.status || "all"}
                onValueChange={(value) => handleSelectFilterChange("status", value)}
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
            <TransactionsTable
              transactions={transactions}
              onViewPaymentsClick={handleViewPayments}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
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
