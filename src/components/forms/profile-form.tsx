"use client";

import React, { useTransition, useEffect } from "react";
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
import { updateUserProfileAction, updateUserProfileActionSchema } from "@/app/(admin)/profile/actions";
import type { SelectUser, UpdateUserProfile } from "@/db/repositories/schemas/userSchema";

interface ProfileFormProps {
  currentUser: SelectUser | null; // Allow null if user data might not be initially available
}

// Schema for the form itself, matching the action's input data schema
const profileFormSchema = updateUserProfileActionSchema; // This is z.object({ name, email, image })
type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      email: currentUser?.email ?? "",
      image: currentUser?.image ?? "", // Ensure this is a string, or handle null if image can be cleared
    },
  });

  useEffect(() => {
    // Reset form if currentUser prop changes (e.g., after initial load)
    if (currentUser) {
      form.reset({
        name: currentUser.name ?? "",
        email: currentUser.email ?? "",
        image: currentUser.image ?? "",
      });
    }
  }, [currentUser, form]);

  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateUserProfileAction(values);
        if (result.success && result.data) {
          toast.success("Perfil atualizado com sucesso!");
          // Optionally reset form with new data if action returns it and it's desired
          // form.reset({ name: result.data.name ?? "", email: result.data.email ?? "", image: result.data.image ?? "" });
        } else {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof ProfileFormValues, {
                type: "server",
                message: errors.join(", "),
              });
            });
          }
          toast.error(result.error || "Falha ao atualizar perfil.");
        }
      } catch (error) {
        toast.error("Ocorreu um erro inesperado.");
        console.error("Update profile error:", error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Seu nome de exibição público.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormDescription>Seu endereço de email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem de Perfil</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/imagem.png" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>
                URL para sua imagem de perfil. Deixe em branco se não desejar alterar ou para remover.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}
