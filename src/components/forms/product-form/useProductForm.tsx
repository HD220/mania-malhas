"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadS3 } from "@/utils";
import { getUrlUpload } from "./actions";
import { unknown, z } from "zod";
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
      const sendImages = formData.images?.map(async (image, index) => {
        if (image.active && image.progress !== 1) {
          try {
            await uploadS3(image.uploadUrl!, image.file!, (progress) => {
              form.setValue(`images.${index}.progress`, progress);
            });
          } catch (error: any) {
            throw new Error(error);
          }
        }
      });

      await Promise.all(sendImages || []);

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
    addImage,
    removeImage,
    submit,
  };
}
