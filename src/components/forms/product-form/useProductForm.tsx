"use client";

import { useFieldArray, useForm, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadS3 } from "@/utils";
import { getUrlUpload } from "./actions";
import { z } from "zod";
import { InsertProductWithImages } from "@/db/repositories/schemas/productImageSchema";
import { useToast } from "@/components/ui/use-toast";
import { CreateProductServerResponse } from "@/app/product/new/actions"; // Assuming this path
import { UpdateProductServerResponse } from "@/app/product/[id]/edit/actions"; // Assuming this path
import { redirect, useRouter } from "next/navigation";


export const formProductSchema = z.object({
  id: z.string().uuid("Código inválido").optional(),
  name: z.string().min(1, "Nome é obrigatório."),
  description: z.string().nullish(),
  price: z.coerce.number({invalid_type_error: "Preço deve ser um número."}).positive("Preço deve ser positivo."),
  active: z.boolean(),
  images: z
    .object({
      id: z.string().uuid().optional(),
      name: z.string(),
      url: z.string().url(),
      uploadUrl: z.string().url().optional(),
      active: z.boolean().default(true),
      file: z.instanceof(File).optional(),
      progress: z.number().gte(0).default(1).optional(),
    })
    .array()
    .optional(),
});

export type FormProduct = z.infer<typeof formProductSchema>;

// The onSubmit prop now expects a function that returns a Promise of the server response type
export type UseProductFormProps = {
  initialValues: FormProduct;
  onSubmit: (data: InsertProductWithImages) => Promise<CreateProductServerResponse | UpdateProductServerResponse>;
};

export function useProductForm({
  initialValues,
  onSubmit,
}: UseProductFormProps) {
  const form = useForm<FormProduct>({
    resolver: zodResolver(formProductSchema),
    defaultValues: {
      ...initialValues,
      active: initialValues.active ?? true, // Ensure active defaults to true if not present
    },
  });

  const { fields, append, remove } = useFieldArray({ // Added remove
    name: "images",
    control: form.control,
  });

  const { toast } = useToast();
  const router = useRouter();

  const addImage: <T extends File>(acceptedFiles: T[]) => void = (
    acceptedFiles
  ) => {
    acceptedFiles.forEach(async (file) => {
      const fileExt = file.type.split("/")[1];
      let presigned;
      try {
        presigned = await getUrlUpload(fileExt);
      } catch (e) {
        toast({ variant: "destructive", title: "Erro no Upload", description: "Não foi possível obter URL para upload." });
        return;
      }

      const object = {
        name: file.name,
        url: URL.createObjectURL(file), // Local preview URL
        active: true,
        file: file,
        uploadUrl: presigned.url,
        progress: 0.0,
      };
      // Check if image with same name already exists to replace, or append
      const existingImageIndex = fields.findIndex(field => field.name === file.name && field.active);
      if (existingImageIndex !== -1) {
        form.setValue(`images.${existingImageIndex}`, object);
      } else {
        append(object);
      }
    });
  };

  // removeImage now just updates the 'active' flag for existing images,
  // or completely removes new images not yet saved.
  const removeImage = async (index: number) => {
    const imageField = form.getValues("images")![index];
    if (imageField.id) { // If it's an existing image (has an ID)
      form.setValue(`images.${index}.active`, false);
    } else { // If it's a new image (no ID yet, just added to form)
      remove(index); // Remove from field array entirely
    }
  };

  const submit = async (formData: FormProduct) => {
    form.clearErrors(); // Clear previous errors
    try {
      const activeImagesToUpload = formData.images?.filter(img => img.active && img.file && img.progress !== 1 && img.uploadUrl) || [];

      const uploadPromises = activeImagesToUpload.map(async (image, i) => {
        // Find original index in formData.images to update progress correctly
        const originalIndex = formData.images?.findIndex(fi => fi.url === image.url && fi.name === image.name);
        if (originalIndex === undefined || originalIndex === -1) return;

        try {
          await uploadS3(image.uploadUrl!, image.file!, (progress) => {
            form.setValue(`images.${originalIndex}.progress`, progress);
          });
           // After successful upload, update the URL to the S3 URL (first part of presigned URL)
           form.setValue(`images.${originalIndex}.url`, image.uploadUrl!.split("?")[0]);
        } catch (error: any) {
          console.error("Upload S3 error:", error);
          // Set error for this specific image field if possible, or a general form error
          form.setError(`images.${originalIndex}.file` as any, { type: 'manual', message: 'Falha no upload.' });
          throw new Error(`Falha no upload da imagem: ${image.name}`); // Propagate to be caught by main try/catch
        }
      });

      await Promise.all(uploadPromises);

      // Prepare data for submission, only include active images
      const dataToSubmit: InsertProductWithImages = {
        ...formData,
        id: formData.id || undefined, // Ensure id is string or undefined
        active: formData.active ?? true,
        images: formData.images
          ?.filter(img => img.active || img.id) // Send images that are active OR are existing ones (to handle deactivation)
          .map(({ file, uploadUrl, progress, ...rest }) => ({
            ...rest,
            id: rest.id || undefined,
            url: rest.file ? uploadUrl!.split("?")[0] : rest.url, // Use final S3 URL
          })),
      };

      const result = await onSubmit(dataToSubmit);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message || "Produto salvo com sucesso!",
        });
        router.push("/product/list"); // Manual redirect after success
      } else {
        if (result.errors) {
          for (const [fieldName, fieldErrors] of Object.entries(result.errors)) {
            if (fieldErrors && fieldErrors.length > 0) {
              form.setError(fieldName as any, { // Use 'any' for fieldName if it's deeply nested like 'images.0.name'
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
    addImage,
    removeImage,
    submit,
  };
}
