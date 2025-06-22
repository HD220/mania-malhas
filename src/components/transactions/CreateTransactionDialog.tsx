"use client";

import * as React from "react";
import { useState, useEffect, useTransition } from "react"; // Added useTransition
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
  DialogClose, // Added DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  // FormField,
  // FormItem,
  // FormLabel,
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
import { CalendarIcon, ChevronsUpDown, Check } from "lucide-react"; // Added ChevronsUpDown, Check
import { format } from "date-fns";
import { ptBR } from "date-fns/locale"; // For date formatting
import { getPartners } from "@/app/partner/list/actions"; // Import server action
import { type SelectPartner } from "@/db/repositories/schemas/partnerSchema"; // Import type
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { createTransactionAction, CreateTransactionServerResponse } from "@/app/(admin)/transactions/actions"; // Import server action
import { toast } from "sonner"; // Import toast
import { Loader2 } from "lucide-react"; // For loading indicator

// Define the Zod schema for form validation (based on previous step's analysis)
// This will be refined with actual field components later.
const createTransactionFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória."),
  // Using z.string() for value as InputMoneyField provides a string.
  // The action will handle conversion/validation before passing to the use case,
  // which expects a number or can coerce a numeric string.
  // The refine here is for client-side feedback.
  value: z.string().min(1, "Valor é obrigatório.").refine(val => {
    const num = parseFloat(val.replace('.', '').replace(',', '.')); // Handle both , and . as decimal, remove thousands separators for parsing
    return !isNaN(num) && num > 0;
  }, {
    message: "Valor deve ser um número positivo. Ex: 123,45 ou 123.45",
  }),
  type: z.enum(["E", "S"], {
    required_error: "Tipo é obrigatório.",
    errorMap: () => ({ message: "Tipo deve ser 'E' (Entrada) ou 'S' (Saída)." })
  }),
  status: z.enum(["Pendente", "Pago", "Cancelado"], { // Assuming these statuses
    required_error: "Status é obrigatório.",
  }),
  partnerId: z.string().uuid("ID do Parceiro inválido."), // Placeholder, will be a select/combobox
  date: z.date({ required_error: "Data da transação é obrigatória." }),
  dueDate: z.date().optional(),
});

type CreateTransactionFormValues = z.infer<typeof createTransactionFormSchema>;

export function CreateTransactionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [partners, setPartners] = useState<SelectPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionFormSchema),
    defaultValues: {
      description: "",
      value: "",
      type: undefined, // To ensure placeholder is shown for select
      status: "Pendente", // Default status
      partnerId: "", // Will be handled by a selector
      date: new Date(),
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (isOpen && partners.length === 0 && !partnersLoading) { // Fetch only if dialog is open and partners not loaded
      const fetchPartners = async () => {
        setPartnersLoading(true);
        try {
          const fetchedPartners = await getPartners("", true); // Fetch all active partners
          setPartners(fetchedPartners);
        } catch (error) {
          console.error("Failed to fetch partners:", error);
          // Optionally, show a toast error here
        } finally {
          setPartnersLoading(false);
        }
      };
      fetchPartners();
    }
  }, [isOpen, partners.length, partnersLoading]); // Added dependencies

  const onSubmit = (data: CreateTransactionFormValues) => {
    startTransition(async () => {
      // Ensure value is a string representation of a number for the action
      // The use case's Zod schema will coerce it to a number.
      const formData = {
        ...data,
        value: String(data.value).replace(',', '.'), // Ensure dot for decimal
      };

      try {
        const response: CreateTransactionServerResponse = await createTransactionAction(formData);

        if (response.success && response.data) {
          toast.success(response.message || "Transação criada com sucesso!");
          form.reset();
          setIsOpen(false);
        } else {
          if (response.errors) {
            Object.entries(response.errors).forEach(([key, value]) => {
              if (value && value.length > 0) {
                form.setError(key as keyof CreateTransactionFormValues, {
                  type: "server",
                  message: value.join(", "),
                });
              }
            });
            toast.error("Por favor, corrija os erros no formulário.");
          } else {
            toast.error(response.message || "Falha ao criar transação.");
          }
        }
      } catch (error) {
        console.error("Create transaction submission error:", error);
        toast.error("Ocorreu um erro inesperado ao criar a transação.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nova Transação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]"> {/* Adjust width as needed */}
        <DialogHeader>
          <DialogTitle>Criar Nova Transação</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da transação abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="create-transaction-form">
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
                // Using InputMoneyField requires careful handling of its props if it's not fully RHF compatible
                // For now, let's use a standard Input and handle currency formatting/parsing manually or via Zod refine
                // Or, if InputMoneyField is RHF-compatible via `field` prop, it can be used directly.
                // Assuming InputMoneyField is designed to be spread with `field` from RHF:
                <InputMoneyField label="Valor" placeholder="0,00" {...field} />
                // If not, it would be:
                // <FormItem>
                //   <FormLabel>Valor</FormLabel>
                //   <FormControl>
                //     <Input type="text" placeholder="0,00" {...field} onChange={e => field.onChange(e.target.value.replace('.', '').replace(',', '.'))} />
                //   </FormControl>
                //   <FormMessage />
                // </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={comboboxOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
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
                        {partnersLoading && <div className="p-4 text-sm text-center">Carregando...</div>}
                        {!partnersLoading && <CommandEmpty>Nenhum parceiro encontrado.</CommandEmpty>}
                        {!partnersLoading && partners.length > 0 && (
                          <CommandList> {/* Use CommandList for scrolling if many items */}
                            <CommandGroup>
                              {partners.map((partner) => (
                                <CommandItem
                                  value={partner.id} // Use partner.id for value
                                  key={partner.id}
                                  onSelect={(currentValue) => {
                                    form.setValue("partnerId", currentValue === field.value ? "" : currentValue);
                                    setComboboxOpen(false);
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
                              format(field.value, "PPP", { locale: ptBR })
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
                          selected={field.value}
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
                              format(field.value, "PPP", { locale: ptBR })
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
                          selected={field.value}
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
        <DialogFooter className="pt-4"> {/* Added pt-4 for spacing */}
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="create-transaction-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Transação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
