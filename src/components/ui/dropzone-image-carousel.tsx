"use client";

import { useDropzone } from "@/components/providers/dropzone-provider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HTMLAttributes, ReactNode } from "react";
import { DropzoneInputProps } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { FormProduct } from "../forms/product-form/useProductForm";
import { Progress } from "./progress";

export type DropzoneImageCarousel = {
  multiple?: boolean;
  onRemove: (index: number) => Promise<void>;
  files: FormProduct["images"];
};

export function DropzoneImageCarousel({
  onRemove,
  files,
  ...rest
}: DropzoneImageCarousel) {
  const { getRootProps, getInputProps, open } = useDropzone();

  return (
    <Carousel className="mx-[50px]" {...getRootProps()}>
      <CarouselContent className="">
        <DropzoneImageCarouselInput
          inputProps={getInputProps()}
          open={open}
          {...rest}
        />

        {files?.map((file, index) => {
          return (
            file.active && (
              <DropzoneImageCarouselItem key={`${file.name}`}>
                <Button
                  size="sm"
                  variant={"destructive"}
                  type="button"
                  className="absolute right-0 top-0 rounded-full p-1 h-auto -mx-0 -my-0 z-10"
                  onClick={() => onRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <DropzoneImageCarouselCard>
                  <Image
                    src={file.url!}
                    alt={file.name}
                    fill
                    sizes="100%"
                    className="object-cover"
                    onLoad={() => URL.revokeObjectURL(file.url!)}
                  />
                  <Progress
                    value={(file.progress || 0) * 100}
                    className="absolute bottom-2 h-2 w-[90%]"
                    progressClassName="bg-primary/50"
                  />
                </DropzoneImageCarouselCard>
              </DropzoneImageCarouselItem>
            )
          );
        })}
      </CarouselContent>
      <CarouselPrevious type="button" />
      <CarouselNext type="button" />
    </Carousel>
  );
}

export function DropzoneImageCarouselInput({
  inputProps,
  open,
}: {
  inputProps: DropzoneInputProps;
  open: () => void;
}) {
  return (
    <DropzoneImageCarouselItem>
      <DropzoneImageCarouselCard onClick={open}>
        <span className="text-3xl font-semibold">
          <input {...inputProps} multiple />
          <Plus />
        </span>
      </DropzoneImageCarouselCard>
    </DropzoneImageCarouselItem>
  );
}

export function DropzoneImageCarouselCard({
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card {...rest}>
      <CardContent className="flex aspect-square items-center justify-center p-2 relative rounded-md overflow-clip">
        {children}
      </CardContent>
    </Card>
  );
}

export function DropzoneImageCarouselItem({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CarouselItem className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:md:basis-1/6 w-[0px] relative">
      <div className="p-1">{children}</div>
    </CarouselItem>
  );
}
