"use client";

import { Plus, X } from "lucide-react";
import Image from "next/image";
import { HTMLAttributes, ReactNode } from "react";
import { DropzoneInputProps } from "react-dropzone";

import { useDropzone } from "@/components/providers/dropzone-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "./progress";

// Define a generic image type here for now to remove feature dependency
export type GenericImageType = {
  name: string;
  url?: string; // URL might not exist for newly added files before upload
  file?: File; // For files not yet uploaded
  active: boolean;
  progress?: number;
};

export type DropzoneImageCarouselProps = {
  multiple?: boolean;
  onRemove: (index: number) => Promise<void>;
  files: GenericImageType[];
};

export function DropzoneImageCarousel({
  onRemove,
  files,
  ...rest // Spread the rest of the props for the Carousel component
}: DropzoneImageCarouselProps & Omit<React.ComponentProps<typeof Carousel>, 'children'>) { // Ensure ...rest is typed
  const { getRootProps, getInputProps, open } = useDropzone();

  return (
    <Carousel className="mx-[50px]" {...getRootProps()} {...rest}>
      <CarouselContent className="">
        <DropzoneImageCarouselInput
          inputProps={getInputProps()}
          open={open}
        />

        {files?.map((file, index) => {
          return (
            file.active && (
              <DropzoneImageCarouselItem key={`${file.name}-${index}`}> {/* Improved key */}
                <Button
                  size="sm"
                  variant={"destructive"}
                  type="button"
                  className="absolute right-0 top-0 rounded-full p-1 h-auto -mx-0 -my-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering dropzone's open
                    onRemove(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
                <DropzoneImageCarouselCard>
                  {file.url && ( /* Check if url exists before using it */
                    <Image
                      src={file.url}
                      alt={file.name}
                      fill
                      sizes="100%"
                      className="object-cover"
                      onLoad={() => {
                        if (file.url?.startsWith("blob:")) { // Only revoke blob URLs
                           URL.revokeObjectURL(file.url);
                        }
                      }}
                    />
                  )}
                  {file.progress !== undefined && file.progress < 1 && ( /* Show progress if defined and not complete */
                    <Progress
                      value={(file.progress || 0) * 100}
                      className="absolute bottom-2 h-2 w-[90%]"
                      progressClassName="bg-primary/50"
                    />
                  )}
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
          <input {...inputProps} /> {/* Removed multiple as it's controlled by DropzoneOptions */}
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
