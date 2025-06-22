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
import { listTransactionsAction } from "../actions"; // CORRECTED PATH
import { TransactionWithPartner } from "@/db/repositories/transactionRepository";
import { TransactionPaymentsModal } from "@/components/transaction-payments-modal";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Importar Input
import { useDebouncedCallback } from "use-debounce"; // Importar useDebouncedCallback
import { CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown, SearchIcon } from "lucide-react"; // Adicionar SearchIcon
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isValid as isValidDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/utils";
import { UseCaseOrderByParams } from "@/usecases/transaction/getTransactionsUseCase";

interface TransactionFilters {
  type?: "E" | "S";
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  partnerId?: string;
  description?: string;
}

type SortableColumn = keyof Pick<TransactionWithPartner, "date" | "value" | "status" | "description" | "type">;
interface SortConfig {
  column: SortableColumn;
  direction: "asc" | "desc";
}

function TransactionsTable({
  transactions,
  onViewPaymentsClick,
  sortConfig,
  onSort,
}: {
  transactions: TransactionWithPartner[];
  onViewPaymentsClick: (transaction: TransactionWithPartner) => void;
  sortConfig: SortConfig;
  onSort: (column: SortableColumn) => void;
}) {
  if (!transactions || transactions.length === 0) {
    return <p>Nenhuma transação encontrada.</p>;
  }

  const renderSortIcon = (column: SortableColumn) => {
    if (sortConfig.column !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/70 group-hover:text-foreground" />;
    }
    return sortConfig.direction === "asc" ?
      <ArrowUp className="ml-1 h-3 w-3 text-foreground" /> :
      <ArrowDown className="ml-1 h-3 w-3 text-foreground" />;
  };

  const thClassName = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group"; // Adicionado group para hover no ícone
  const thSortableClassName = `${thClassName} cursor-pointer hover:bg-gray-100`;

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className={thSortableClassName} onClick={() => onSort("description")}>
              <div className="flex items-center">Descrição {renderSortIcon("description")}</div>
            </th>
            <th scope="col" className={thClassName}>Parceiro</th>
            <th scope="col" className={thSortableClassName} onClick={() => onSort("value")}>
              <div className="flex items-center">Valor {renderSortIcon("value")}</div>
            </th>
            <th scope="col" className={thSortableClassName} onClick={() => onSort("type")}>
              <div className="flex items-center">Tipo {renderSortIcon("type")}</div>
            </th>
            <th scope="col" className={thSortableClassName} onClick={() => onSort("status")}>
              <div className="flex items-center">Status {renderSortIcon("status")}</div>
            </th>
            <th scope="col" className={thSortableClassName} onClick={() => onSort("date")}>
             <div className="flex items-center">Data {renderSortIcon("date")}</div>
            </th>
            <th scope="col" className={`${thClassName} text-center`}>Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.partnerName || transaction.partnerId}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(transaction.value as any))}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.type === 'E' ? 'Entrada' : 'Saída'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.status}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Intl.DateTimeFormat("pt-BR").format(new Date(transaction.date))}</td>
              <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                <Button variant="ghost" size="sm" onClick={() => onViewPaymentsClick(transaction)}>Ver Pagamentos</Button>
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

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: "date", direction: "desc" });
  const [descriptionSearch, setDescriptionSearch] = useState("");

  const handleFilterChange = (newFilters: Partial<TransactionFilters>) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const debouncedSetDescriptionFilter = useDebouncedCallback((value: string) => {
    handleFilterChange({ description: value.trim() === "" ? undefined : value.trim() });
  }, 500);

  const handleDescriptionSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionSearch(event.target.value);
    debouncedSetDescriptionFilter(event.target.value);
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({});
    setDescriptionSearch("");
    // Manter a ordenação atual ou resetar? Por enquanto, manter.
    // setSortConfig({ column: "date", direction: "desc" });
  };

  // const handleSelectFilterChange = (filterName: "type" | "status", value: string) => {
  //   setCurrentPage(1);
  //   setFilters(prev => ({ ...prev, ...newFilters }));
  // };
  // This first declaration was buggy (newFilters not defined) and duplicated.

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
          <div className="flex flex-wrap items-end gap-2 mb-4 p-4 border rounded-lg">
            <div className="grid gap-1.5 flex-grow min-w-[180px] sm:flex-grow-0">
              <Label htmlFor="filter-description">Buscar por Descrição</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="filter-description"
                  type="text"
                  placeholder="Ex: Venda Camiseta..."
                  className="pl-8 w-full"
                  value={descriptionSearch}
                  onChange={handleDescriptionSearchChange}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-type">Tipo</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => handleSelectFilterChange("type", value)}
              >
                <SelectTrigger id="filter-type" className="w-full min-w-[120px] sm:w-auto">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
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
                <SelectTrigger id="filter-status" className="w-full min-w-[130px] sm:w-auto">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
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
                      "w-full min-w-[150px] sm:w-auto justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom && isValidDate(filters.dateFrom) ? format(filters.dateFrom, "dd/MM/yy", { locale: ptBR }) : <span>De</span>}
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
                      "w-full min-w-[150px] sm:w-auto justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo && isValidDate(filters.dateTo) ? format(filters.dateTo, "dd/MM/yy", { locale: ptBR }) : <span>Até</span>}
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
            <Button variant="outline" onClick={clearFilters} className="self-end">Limpar Filtros</Button>
          </div>
          {isLoading && <p className="text-center py-4">Carregando transações...</p>}
          {error && <p className="text-destructive text-center py-4">Erro: {error}</p>}
          {!isLoading && !error && (
            <TransactionsTable
              transactions={transactions}
              onViewPaymentsClick={handleViewPayments}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4 border-t">
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
