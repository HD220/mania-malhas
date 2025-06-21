"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation"; // Import useRouter
import { CreatePartnerServerResponse } from "@/app/partner/new/actions"; // Adjust path as necessary
import { UpdatePartnerServerResponse } from "@/app/partner/[id]/edit/actions"; // Adjust path as necessary

export const formPartnerSchema = insertPartnerSchema;

export type FormPartner = z.infer<typeof formPartnerSchema>;

// Update onSubmit prop to expect a function that returns the server response type
export type UsePartnerFormProps = {
  initialValues: FormPartner;
  onSubmit: (
    data: InsertPartner
  ) => Promise<CreatePartnerServerResponse | UpdatePartnerServerResponse>;
};

export function usePartnerForm({
  initialValues,
  onSubmit,
}: UsePartnerFormProps) {
  const form = useForm<FormPartner>({
    resolver: zodResolver(formPartnerSchema),
    defaultValues: {
      ...initialValues,
      active: initialValues.active ?? true, // Ensure active defaults to true
    },
  });

  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const submit = async (formData: FormPartner) => {
    form.clearErrors(); // Clear previous errors
    try {
      // Ensure 'active' has a boolean value.
      // The schema should handle other default values if necessary.
      const dataToSubmit: InsertPartner = {
        ...formData,
        id: formData.id || undefined, // Ensure id is string or undefined
        active: formData.active ?? true,
      };

      const result = await onSubmit(dataToSubmit);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message || "Parceiro salvo com sucesso!",
        });
        router.push("/partner/list"); // Redirect to partner list on success
      } else {
        if (result.errors) {
          for (const [fieldName, fieldErrors] of Object.entries(result.errors)) {
            if (fieldErrors && fieldErrors.length > 0) {
              form.setError(fieldName as any, { // Use 'any' for fieldName for simplicity
                type: "server",
                message: fieldErrors.join(", "),
              });
            }
          }
        }
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: result.message || "Por favor, corrija os erros no formulário.",
        });
      }
    } catch (error: any) {
      // This catch block handles unexpected errors (e.g., network issues, server crashes)
      toast({
        variant: "destructive",
        title: "Ops! Erro inesperado",
        description: error.message || "Ocorreu um erro inesperado.",
      });
    }
  };

  return {
    form,
    submit,
  };
}
