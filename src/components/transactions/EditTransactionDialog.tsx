"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputMoneyField } from "@/components/ui/input-money-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronsUpDown, Check, Pencil, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getPartners } from "@/features/partner/actions";
import { type SelectPartner } from "@/features/partner/schemas/partnerSchema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getTransactionByIdAction, GetTransactionByIdServerResponse, updateTransactionAction, UpdateTransactionServerResponse } from "@/app/(admin)/transactions/actions"; // Added updateTransactionAction
import { type SelectTransaction } from "@/db/repositories/schemas/transactionSchema";
import { useTransition } from "react"; // Uncommented
import { toast } from "sonner"; // Uncommented
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// Zod Schema for Edit Form
const editTransactionFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória."),
  value: z.string().min(1, "Valor é obrigatório.").refine(val => {
    const num = parseFloat(val.replace('.', '').replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, {
    message: "Valor deve ser um número positivo. Ex: 123,45 ou 123.45",
  }),
  type: z.enum(["E", "S"], { required_error: "Tipo é obrigatório." }),
  status: z.enum(["Pendente", "Pago", "Cancelado"], { required_error: "Status é obrigatório." }),
  partnerId: z.string().uuid("ID do Parceiro inválido.").min(1, "Parceiro é obrigatório."),
  date: z.date({ required_error: "Data da transação é obrigatória." }),
  dueDate: z.date().optional(),
});
type EditTransactionFormValues = z.infer<typeof editTransactionFormSchema>;

interface EditTransactionDialogProps {
  transactionId: string;
  // currentTransactionData?: SelectTransaction; // Could pass initial data to avoid first fetch flicker
  triggerButton?: React.ReactNode; // Allow custom trigger
}

export function EditTransactionDialog({
  transactionId,
  triggerButton,
}: EditTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  // States for partner combobox
  const [partners, setPartners] = useState<SelectPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnerComboboxOpen, setPartnerComboboxOpen] = useState(false); // Renamed to avoid conflict if other comboboxes are added

  const [isSubmitting, startSubmitTransition] = useTransition(); // Uncommented and using isSubmitting

  const form = useForm<EditTransactionFormValues>({
    resolver: zodResolver(editTransactionFormSchema),
    // Default values will be set by form.reset() after fetching data
  });

  useEffect(() => {
    const loadTransactionData = async () => {
      if (isOpen && transactionId) {
        setIsLoadingData(true);
        setInitialDataError(null);
        try {
          const response = await getTransactionByIdAction(transactionId);
          if (response.success && response.data) {
            // Format data for the form, especially dates and value
            // The 'value' from SelectTransaction is already a number due to Zod coercion in select schema.
            // InputMoneyField expects a string, so we format it.
            // Dates from DB are likely ISO strings or Date objects; RHF Calendar expects Date objects.
            const transaction = response.data;
            form.reset({
              description: transaction.description || "",
              value: String(transaction.value), // InputMoneyField likely takes string
              type: transaction.type,
              status: transaction.status,
              partnerId: transaction.partnerId,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              dueDate: transaction.due_date ? new Date(transaction.due_date) : undefined,
            });
          } else {
            setInitialDataError(response.message || "Não foi possível carregar os dados da transação.");
            // Consider toast.error here too
          }
        } catch (error) {
          console.error("Failed to load transaction data:", error);
          setInitialDataError("Erro ao carregar dados da transação.");
          // Consider toast.error here too
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    loadTransactionData();
  }, [isOpen, transactionId, form]); // form added to dependency array for form.reset

  // useEffect for fetching partners (copied and adapted from CreateTransactionDialog)
  useEffect(() => {
    if (isOpen && partners.length === 0 && !partnersLoading) {
      const fetchPartners = async () => {
        setPartnersLoading(true);
        try {
          const fetchedPartners = await getPartners("", true); // Fetch all active partners
          setPartners(fetchedPartners);
        } catch (error) {
          console.error("Failed to fetch partners for edit dialog:", error);
          // Optionally, show a toast error here
        } finally {
          setPartnersLoading(false);
        }
      };
      fetchPartners();
    }
  }, [isOpen, partners.length, partnersLoading]);


  const onSubmit = (data: EditTransactionFormValues) => {
    startSubmitTransition(async () => {
      const formDataForAction = {
        ...data,
        value: String(data.value).replace(',', '.'), // Ensure dot for decimal for backend
        // Ensure dates are in a format the action/use case expects if not already Date objects
        // If date objects are fine, no change needed here for date/dueDate
      };

      try {
        const response: UpdateTransactionServerResponse = await updateTransactionAction(transactionId, formDataForAction);

        if (response.success && response.data) {
          toast.success(response.message || "Transação atualizada com sucesso!");
          setIsOpen(false); // Close dialog on success
          // No form.reset() needed typically for edit, as user might want to see new values or dialog closes.
          // Revalidation of path in action should update any lists.
        } else {
          if (response.errors) {
            Object.entries(response.errors).forEach(([key, value]) => {
              if (value && value.length > 0) {
                form.setError(key as keyof EditTransactionFormValues, { // Use EditTransactionFormValues here
                  type: "server",
                  message: value.join(", "),
                });
              }
            });
            toast.error("Por favor, corrija os erros no formulário.");
          } else {
            toast.error(response.message || "Falha ao atualizar transação.");
          }
        }
      } catch (error) {
        console.error("Update transaction submission error:", error);
        toast.error("Ocorreu um erro inesperado ao atualizar a transação.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton ? triggerButton : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar Transação</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da transação abaixo.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData && (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando dados da transação...</p>
          </div>
        )}

        {!isLoadingData && initialDataError && (
          <div className="py-12 text-center text-red-600">
            <p>Erro ao carregar dados: {initialDataError}</p>
          </div>
        )}

        {!isLoadingData && !initialDataError && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="edit-transaction-form">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pagamento fornecedor XYZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <InputMoneyField label="Valor" placeholder="0,00" {...field} />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}> {/* Use value prop for controlled component */}
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="E">Entrada</SelectItem>
                          <SelectItem value="S">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}> {/* Use value prop */}
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="partnerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Parceiro</FormLabel>
                    <Popover open={partnerComboboxOpen} onOpenChange={setPartnerComboboxOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={partnerComboboxOpen}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={partnersLoading || isLoadingData} // Disable while loading transaction or partners
                          >
                            {field.value
                              ? partners.find(
                                  (partner) => partner.id === field.value
                                )?.name
                              : "Selecione um parceiro"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar parceiro..." disabled={partnersLoading} />
                          {partnersLoading && <div className="p-4 text-sm text-center">Carregando parceiros...</div>}
                          {!partnersLoading && <CommandEmpty>Nenhum parceiro encontrado.</CommandEmpty>}
                          {!partnersLoading && partners.length > 0 && (
                            <CommandList>
                              <CommandGroup>
                                {partners.map((partner) => (
                                  <CommandItem
                                    value={partner.id}
                                    key={partner.id}
                                    onSelect={(currentValue) => {
                                      form.setValue("partnerId", currentValue === field.value ? "" : currentValue);
                                      setPartnerComboboxOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === partner.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {partner.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data da Transação</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: ptBR }) // Ensure field.value is Date
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined} // Ensure Date object
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Vencimento (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: ptBR }) // Ensure field.value is Date
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined} // Ensure Date object
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting || isLoadingData}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="edit-transaction-form" disabled={isSubmitting || isLoadingData}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
