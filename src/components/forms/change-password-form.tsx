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
import { changeUserPasswordAction, changeUserPasswordActionSchema } from "@/app/(admin)/profile/actions";

// Schema for the form itself, matching the action's input data schema
// The action expects newPasswordHash directly
const changePasswordFormSchema = changeUserPasswordActionSchema; // This is z.object({ newPasswordHash })
type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      newPasswordHash: "", // Assuming it's a hash, but for UI it's typed as password
                           // In a real scenario, this would be 'newPassword' and 'confirmPassword'
                           // and hashing would happen before calling the action, or inside the action.
                           // For this task, we accept a "hash" directly.
    },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    startTransition(async () => {
      try {
        // For now, we assume `values.newPasswordHash` is the actual hash.
        // If it were plain text, hashing logic would be here or in the action.
        const result = await changeUserPasswordAction({ newPasswordHash: values.newPasswordHash });

        if (result.success) {
          toast.success("Senha alterada com sucesso!");
          form.reset(); // Clear form on success
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
                {/*
                  Although the field is 'newPasswordHash', for user input, it should behave like a password field.
                  In a real scenario with plain text passwords, this would be:
                  1. Current Password (type="password")
                  2. New Password (type="password")
                  3. Confirm New Password (type="password")
                  The current setup is simplified as per plan (action expects hash).
                  This UI is slightly awkward as it asks for a "hash".
                  A more realistic UI would take a new password, and the form/action would handle hashing.
                  For now, this matches the simplified backend.
                */}
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
