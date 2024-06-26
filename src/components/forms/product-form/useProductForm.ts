"use client";

import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { DropEvent, FileRejection } from "react-dropzone";
import { createHash } from "crypto";
import {
  InsertProductWithImage,
  SelectProductImage,
  insertProductWithImageSchema,
} from "@/db/postgres/schema/productImage";

function uploadS3(
  url: string,
  file: File,
  onprogress: (progress: number) => void
) {
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", url);
  xhr.setRequestHeader("Content-Type", file.type);
  xhr.upload.addEventListener("progress", (ev) =>
    onprogress(ev.loaded / ev.total)
  );
  xhr.upload.addEventListener("load", () => onprogress(1));
  xhr.send(file);
}

export type FormImages = Record<
  string,
  Pick<
    SelectProductImage,
    "id" | "name" | "s3name" | "size" | "type" | "url"
  > & { file?: File; progress: number; urlUpload?: string }
>;

export type UseProductFormProps = {
  initialValues?: DefaultValues<InsertProductWithImage>;
  onSubmit: (data: InsertProductWithImage) => Promise<void>;
};

export function useProductForm({
  initialValues,
  onSubmit,
}: UseProductFormProps) {
  const form = useForm<InsertProductWithImage>({
    resolver: zodResolver(insertProductWithImageSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const toObject: any =
    initialValues?.images?.reduce(
      (prev, curr) => ({
        ...prev,
        [curr!.s3name!]: {
          id: curr?.id,
          name: curr?.name,
          type: curr?.type,
          s3name: curr?.s3name,
          size: curr?.size,
          url: curr?.url,
          progress: 1,
          file: "",
        },
      }),
      {}
    ) || {};

  const [images, setImages] = useState<FormImages>(toObject);

  const addImage: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void = (acceptedFiles) => {
    acceptedFiles.forEach(async (file) => {
      try {
        const imageBuffer = Buffer.from(await file.arrayBuffer());
        const imageFingerPrint = createHash("sha256")
          .update(imageBuffer)
          .digest("hex");

        if (!(imageFingerPrint in images)) {
          const fileExt = file.type.split("/")[1]; // 'image/png' -> ['image','png'][1] -> png
          const searchParams = new URLSearchParams();
          searchParams.set("name", `${imageFingerPrint}.${fileExt}`);

          const response = await fetch(
            `/api/presignedurl?${searchParams.toString()}`,
            {
              cache: "no-cache",
              next: {
                revalidate: 0,
              },
            }
          );
          const data = await response.json();
          const presignedUrl = data.url;

          setImages((prev) => {
            const key: any = imageFingerPrint;
            return {
              ...prev,
              [key]: {
                file: file,
                progress: 0,
                url: URL.createObjectURL(file),
                urlUpload: presignedUrl,
              },
            };
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      const filtered = { ...prev };
      delete filtered[key];
      return filtered;
    });
  };

  const submit = async (formData: InsertProductWithImage) => {
    const allImages = Object.values(images);
    const uploadedImages = allImages
      .filter((image) => image.progress === 1)
      .map((image) => ({
        s3name: image.s3name,
        name: image.name,
        size: image.size,
        type: image.type,
        url: image.url,
      }));
    for (const key in images) {
      if (images[key].progress !== 1) {
        console.log("image", images[key].urlUpload!);

        uploadS3(images[key].urlUpload!, images[key].file!, (progress) => {
          setImages((prev) => {
            return {
              ...prev,
              [key]: {
                ...images[key],
                progress,
              },
            };
          });
        });
        uploadedImages.push({
          s3name: key,
          name: images[key].file!.name,
          size: images[key].file!.size,
          type: images[key].file!.type,
          url: images[key].urlUpload!.split("?")[0],
        });
      }
    }

    return await onSubmit({
      ...formData,
      images: uploadedImages,
    });
  };

  return {
    form,
    addImage,
    removeImage,
    submit,
    images,
  };
}
