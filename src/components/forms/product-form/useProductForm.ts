"use client";

import { DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormImages } from "./types";
import { useState } from "react";
import { DropEvent, FileRejection } from "react-dropzone";
import { createHash } from "crypto";
import { ProductSchema, ProductType } from "@/app/product/schema";

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

export type UseProductFormProps = {
  initialValues?: DefaultValues<ProductType>;
  onSubmit: (props: ProductType) => Promise<void>;
};

export function useProductForm({
  initialValues,
  onSubmit,
}: UseProductFormProps) {
  const form = useForm<ProductType>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      ...initialValues,
    },
  });
  const [images, setImages] = useState<FormImages>({});

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

        console.log(imageFingerPrint, file.name, !(imageFingerPrint in images));

        if (!(imageFingerPrint in images)) {
          const fileExt = file.type.split("/")[1]; // 'image/png' -> ['image','png'][1] -> png
          const searchParams = new URLSearchParams();
          searchParams.set("name", `${imageFingerPrint}.${fileExt}`);

          console.log(imageFingerPrint, fileExt);

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
            return {
              ...prev,
              [imageFingerPrint]: {
                file: file,
                progress: 0,
                urlPreview: URL.createObjectURL(file),
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

  const submit = async (formData: ProductType) => {
    const uploadedImages: any = [];
    for (const key in images) {
      if (images[key].progress !== 1) {
        uploadS3(images[key].urlUpload, images[key].file, (progress) => {
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
          s3_name: key,
          name: images[key].file.name,
          size: images[key].file.size,
          type: images[key].file.type,
          url: images[key].urlUpload.split("?")[0],
        });
      }
    }

    console.log("images", uploadedImages);

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
