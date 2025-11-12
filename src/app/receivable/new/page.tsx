"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputDateField } from "@/components/ui/input-date-field";
import { InputField } from "@/components/ui/input-field";
import { InputMoneyField } from "@/components/ui/input-money-field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRef } from "react";
import {
  DayPickerSingleProps,
  DayPickerDefaultProps,
  DayPickerMultipleProps,
  DayPickerRangeProps,
} from "react-day-picker";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  id: z.string().optional(),
  description: z.string().optional(),
  value: z.number().positive(),
  date: z.date(),
  date_due: z.date(),
  transactionId: z.string().uuid().optional(),
});

type FormType = z.infer<typeof formSchema>;

export default function Page() {
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <Card>
            <CardHeader>
              <CardTitle>Nova Conta a Receber</CardTitle>
              <CardDescription>
                Cadastre um novo debito para um cliente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                name="id"
                control={form.control}
                render={({ field }) => (
                  <InputField
                    disabled={true}
                    label="Código"
                    placeholder={field.value?.toString() ?? "NOVO"}
                    className="basis-1/5"
                    {...field}
                  />
                )}
              />
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <InputField
                    label="Descrição"
                    placeholder="ex: Calça Jeans."
                    className="flex-1"
                    {...field}
                  />
                )}
              />
              <FormField
                name="date"
                control={form.control}
                render={({ field }) => <InputDateField {...field} />}
              />

              <FormField
                name="date_due"
                control={form.control}
                render={({ field: { value, ...field } }) => (
                  <InputField
                    label="Data Vencimento"
                    placeholder="ex: Calça Jeans."
                    className="flex-1"
                    type="date"
                    value={value ? value.toString() : ""}
                    {...field}
                  />
                )}
              />
              <FormField
                name="value"
                control={form.control}
                render={({ field }) => (
                  <InputMoneyField
                    label="Descrição"
                    placeholder="ex: Calça Jeans."
                    className="flex-1"
                    {...field}
                  />
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between items-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Salvar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
