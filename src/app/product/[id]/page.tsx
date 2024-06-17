"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropzoneImageCarousel } from "../../../components/dropzone-image-carousel";
import { DropzoneProvider } from "@/components/providers/dropzone-provider";
import { DropEvent, FileRejection } from "react-dropzone";
import { onSubmit } from "./actions";
import { z } from "zod";
import { useEffect, useState } from "react";

type PageProps = {
  params: { id: string };
};

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.coerce.number(),
  images: z
    .object({ file: z.instanceof(File) })
    .array()
    .optional(),
});

type formType = z.infer<typeof formSchema>;

export default function Page({ params }: PageProps) {
  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      // images: [],
    },
  });

  const { fields, append, insert, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const [files, setFiles] = useState<
    {
      file: File;
      preview: string;
      urlUpload: string;
    }[]
  >([]);

  // const files = fields.map(({ file, id }) => {
  //   return {
  //     id,
  //     preview: URL.createObjectURL(file),
  //     file,
  //   };
  // });

  const onRemove = (index?: number | number[]) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
    remove(index);
  };

  const onDrop: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void = async (acceptedFiles, fileRejections, event) => {
    acceptedFiles.forEach(async (file) => {
      try {
        const searchParams = new URLSearchParams();
        searchParams.set("name", file.name);
        const response = await fetch(
          `/api/presignedurl?${searchParams.toString()}`,
          {
            cache: "no-cache",
            next: {
              revalidate: 0,
            },
          }
        );
        const url = (await response.json()).url;

        setFiles((prev) => [
          ...prev,
          { file, preview: URL.createObjectURL(file), urlUpload: url },
        ]);
      } catch (error) {
        console.log(error);
      }
    });
    files?.map(({ file }) => {
      file;
    });

    append(files?.map(({ file }) => ({ file })));
  };

  const submit = async (values: formType) => {
    const { name, description, price } = values;

    try {
      files.forEach(async ({ file, urlUpload }) => {
        await fetch(urlUpload, {
          body: file,
          method: "PUT",
        });
      });

      await onSubmit({
        name,
        description,
        price,
        images: files.map(({ urlUpload }) => ({ url: urlUpload })),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-1 p-8 items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)}>
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar produto</CardTitle>
              <CardDescription>
                Informe os dados do produto e clique em salvar para finalizar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: Calça Jeans." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ex: Calça jeans estilo surrada."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="price"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <Card className="flex">
                      <span className="p-2 bg-muted">R$</span>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          pattern="^d+(.d{1,2})?$"
                          className="flex-1 rounded-l-none border-0 border-l"
                        />
                      </FormControl>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DropzoneProvider
                options={{
                  noClick: true,
                  noKeyboard: true,
                  multiple: true,
                  onDrop,
                }}
              >
                <DropzoneImageCarousel items={fields} remove={onRemove} />
              </DropzoneProvider>
              {/* <ImagesCarousel control={form.control} name="images" /> */}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">Salvar</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
