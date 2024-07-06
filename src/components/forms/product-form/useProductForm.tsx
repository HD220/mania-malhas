"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadS3 } from "@/utils";
import { getUrlUpload } from "./actions";
import { z } from "zod";
import { InsertProductWithImages } from "@/db/repositories/schemas/productImageSchema";
import { useToast } from "@/components/ui/use-toast";

export const formProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().nullish(),
  price: z.coerce.number().positive(),
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

export type UseProductFormProps = {
  initialValues: FormProduct;
  onSubmit: (data: InsertProductWithImages) => Promise<void>;
};

export function useProductForm({
  initialValues,
  onSubmit,
}: UseProductFormProps) {
  const form = useForm<FormProduct>({
    resolver: zodResolver(formProductSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const { fields, append } = useFieldArray({
    name: "images",
    control: form.control,
  });

  const { toast } = useToast();

  const addImage: <T extends File>(acceptedFiles: T[]) => void = (
    acceptedFiles
  ) => {
    acceptedFiles.forEach(async (file) => {
      const fileExt = file.type.split("/")[1];
      const presigned = await getUrlUpload(fileExt);

      const object = {
        name: file.name,
        url: URL.createObjectURL(file),
        active: true,
        file: file,
        uploadUrl: presigned.url,
        progress: 0.0,
      };

      const index = fields.findIndex((field) => field.name === `${file.name}`);
      if (index === -1) {
        append(object);
      } else {
        form.setValue(`images.${index}`, object);
      }
    });
  };

  const removeImage = async (index: number) => {
    const fileData = form.getValues("images")![index];
    form.setValue(`images.${index}`, {
      ...fileData,
      active: false,
    });
  };

  const submit = async (formData: FormProduct) => {
    try {
      formData.images?.forEach((image, index) => {
        if (image.active && image.progress !== 1)
          uploadS3(image.uploadUrl!, image.file!, async (progress) => {
            await new Promise((resolve) =>
              setTimeout(() => resolve(null), 500)
            );
            form.setValue(`images.${index}.progress`, progress);
          })
            .then(() => {
              console.log("file index", index, " uploaded");
            })
            .catch((err) => {
              console.error("não foi possivel realizar o upload", err);
            });
      });

      const data: InsertProductWithImages = {
        ...formData,
        active: formData["active"] ?? true,
        images: formData.images?.map(({ file, uploadUrl, ...rest }) => {
          const url = (uploadUrl ? uploadUrl : rest.url).split("?")[0];
          return {
            ...rest,
            url,
          };
        }),
      };

      await onSubmit(data);
      toast({
        title: "Info:",
        description: "Produto salvo com sucesso!",
        duration: 5000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro:",
        description: "Algo errado ocorreu, tente novamente!",
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
