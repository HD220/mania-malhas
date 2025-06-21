"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { InputMoneyField } from "@/components/ui/input-money-field"; // Re-using InputMoneyField

// Schema Zod para o formulário de pagamento
export const paymentFormSchema = z.object({
  value: z.coerce
    .number({ invalid_type_error: "Valor deve ser um número." })
    .positive("Valor deve ser positivo.")
    .multipleOf(0.01, { message: "Valor deve ter no máximo 2 casas decimais." }),
  date: z.coerce.date({ invalid_type_error: "Data inválida." }).default(new Date()), // Default to today
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  transactionId: string; // Needed to associate the payment
  onSubmit: (data: PaymentFormData & { transactionId: string }) => Promise<any>; // Server action
  onSuccess?: () => void; // Callback on successful submission
  disabled?: boolean;
}

export function PaymentForm({ transactionId, onSubmit, onSuccess, disabled }: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      value: 0,
      date: new Date(),
    },
  });

  const { toast } = useToast(); // Assuming useToast is available via a provider

  async function handleSubmit(data: PaymentFormData) {
    form.clearErrors();
    try {
      const result = await onSubmit({ ...data, transactionId });
      if (result.success) {
        toast({ title: "Sucesso", description: result.message || "Pagamento adicionado!" });
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        if (result.errors) {
          for (const [fieldName, fieldErrors] of Object.entries(result.errors as any)) { // type cast for fieldErrors
            if (fieldErrors && (fieldErrors as string[]).length > 0) {
              form.setError(fieldName as any, {
                type: "server",
                message: (fieldErrors as string[]).join(", "),
              });
            }
          }
        }
        toast({ variant: "destructive", title: "Erro", description: result.message || "Falha ao adicionar pagamento." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro Inesperado", description: (error as Error).message || "Ocorreu um problema." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Pagamento</FormLabel>
              <FormControl>
                <InputMoneyField placeholder="R$ 0,00" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Pagamento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={disabled}
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
                      date > new Date() || date < new Date("1900-01-01") || disabled
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting || disabled}>
          {form.formState.isSubmitting ? "Salvando..." : "Salvar Pagamento"}
        </Button>
      </form>
    </Form>
  );
}

// Helper hook for toast, assuming it's not globally available or needs specific setup
// If you have a global toast provider, this might not be needed.
// For now, assuming useToast from "@/components/ui/use-toast" works.
import { useToast } from "@/components/ui/use-toast";
