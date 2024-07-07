"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import { useToast } from "@/components/ui/use-toast";

export const formPartnerSchema = insertPartnerSchema;

export type FormPartner = z.infer<typeof formPartnerSchema>;

export type UsePartnerFormProps = {
  initialValues: FormPartner;
  onSubmit: (data: InsertPartner) => Promise<void>;
};

export function usePartnerForm({
  initialValues,
  onSubmit,
}: UsePartnerFormProps) {
  const form = useForm<FormPartner>({
    resolver: zodResolver(formPartnerSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const { toast } = useToast();

  const submit = async (formData: FormPartner) => {
    try {
      const data: InsertPartner = {
        ...formData,
        active: formData["active"] ?? true,
      };

      await onSubmit(data);
      toast({
        title: "Info:",
        description: "Cliente salvo com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ops!",
        description: error.message,
      });
    }
  };

  return {
    form,
    submit,
  };
}
