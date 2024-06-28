"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createHashFromFile, uploadS3 } from "@/lib/utils";
import { FormType, formSchema } from "@/db/postgres/schema/productImage";

export type UseProductFormProps = {
  initialValues?: FormType;
  onSubmit: (data: FormType) => Promise<void>;
};

export function useProductForm({
  initialValues,
  onSubmit,
}: UseProductFormProps) {
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const { fields, append, update } = useFieldArray({
    name: "images",
    control: form.control,
  });

  const getPresignedUrl = async (name: string) => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set("name", name);

      const response = await fetch(
        `/api/presignedurl?${searchParams.toString()}`
      );
      const responseData = await response.json();
      const url: string = responseData.url;
      return url;
    } catch (error) {
      console.log(error);
    }
  };

  const addImage: <T extends File>(acceptedFiles: T[]) => void = (
    acceptedFiles
  ) => {
    acceptedFiles.forEach(async (file) => {
      const fileName = await createHashFromFile(file);
      const fileExt = file.type.split("/")[1];
      const index = fields.findIndex((field) => field.s3name === `${fileName}`);

      const presignedUrl = await getPresignedUrl(`${fileName}.${fileExt}`);

      const object = {
        name: file.name,
        s3name: `${fileName}`,
        url: URL.createObjectURL(file),
        file: file,
        type: file.type,
        size: file.size,
        presignedUrl,
        progress: 0.0,
        active: true,
      };

      if (index === -1) {
        append(object);
      } else {
        form.setValue(`images.${index}`, object);
      }
    });
  };

  const removeImage = async (index: number) => {
    const fileData = form.getValues("images")![index];
    const presignedUrl = await getPresignedUrl(
      `${fileData.s3name}.${fileData.type.split("/")[1]}`
    );
    form.setValue(`images.${index}`, {
      ...fileData,
      presignedUrl,
      // progress: 0.0,
      active: false,
    });
  };

  const submit = async (formData: FormType) => {
    console.log("submit");
    formData.images?.forEach((image, index) => {
      // if(!image.active) await deleteS3(image.presignedUrl)
      if (image.active && image.progress !== 1)
        uploadS3(image.presignedUrl!, image.file!, async (progress) => {
          await new Promise((resolve) => setTimeout(() => resolve(null), 500));
          form.setValue(`images.${index}.progress`, progress);
        }).then(() => {
          console.log("file index", index, " uploaded");
        });
    });

    const data: FormType = {
      ...formData,
      images: formData.images?.map(({ file, presignedUrl, url, ...rest }) => ({
        ...rest,
        url: presignedUrl?.split("?")[0] || url,
      })),
    };

    return await onSubmit({
      ...data,
    });
  };

  return {
    form,
    addImage,
    removeImage,
    submit,
  };
}
