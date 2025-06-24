"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { changeUserPasswordAction, changeUserPasswordActionSchema } from "@/features/user/actions";

const changePasswordFormSchema = changeUserPasswordActionSchema;
type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      newPasswordHash: "",
    },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    startTransition(async () => {
      try {
        const result = await changeUserPasswordAction({ newPasswordHash: values.newPasswordHash });

        if (result.success) {
          toast.success("Senha alterada com sucesso!");
          form.reset();
        } else {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof ChangePasswordFormValues, {
                type: "server",
                message: errors.join(", "),
              });
            });
          }
          toast.error(result.error || "Falha ao alterar senha.");
        }
      } catch (error) {
        toast.error("Ocorreu um erro inesperado ao alterar a senha.");
        console.error("Change password error:", error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="newPasswordHash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha (Hash)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Digite o hash da nova senha"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Forneça o hash da nova senha. (Simplificado: em produção, você digitaria a senha normalmente).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Alterando..." : "Alterar Senha"}
        </Button>
      </form>
    </Form>
  );
}
