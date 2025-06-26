"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/features/partner/schemas/partner.schema"; // Updated path
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { CreatePartnerServerResponse, UpdatePartnerServerResponse } from "@/features/partner/actions";

export const formPartnerSchema = insertPartnerSchema;

export type FormPartner = z.infer<typeof formPartnerSchema>;

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
      active: initialValues.active ?? true,
    },
  });

  const { toast } = useToast();
  const router = useRouter();

  const submit = async (formData: FormPartner) => {
    form.clearErrors();
    try {
      const dataToSubmit: InsertPartner = {
        ...formData,
        id: formData.id || undefined,
        active: formData.active ?? true,
      };

      const result = await onSubmit(dataToSubmit);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message || "Parceiro salvo com sucesso!",
        });
        router.push("/partner/list");
      } else {
        if (result.errors) {
          for (const [fieldName, fieldErrors] of Object.entries(result.errors)) {
            if (fieldErrors && fieldErrors.length > 0) {
              form.setError(fieldName as any, {
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
