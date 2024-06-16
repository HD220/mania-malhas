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
import { formSchema, formType } from "./schema";
import { onSubmit } from "./actions";
import { minioClient } from "@/services/minio";

type PageProps = {
  params: { id: string };
};

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
  const files = fields.map(({ file, id }) => {
    return {
      id,
      preview: URL.createObjectURL(file),
      file,
    };
  });

  const onDrop: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void = async (acceptedFiles, fileRejections, event) => {
    const files = acceptedFiles.map((file) => {
      return { file };
    });

    append(files);
  };

  const submit = (values: formType) => {
    const { name, description, price, images } = values;

    const formdata = new FormData();
    images?.forEach(({ file }, index) => {
      formdata.append(`image.${index}`, file);
    });

    onSubmit({
      name,
      description,
      price,
      images: [formdata],
    });
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
                <DropzoneImageCarousel items={files} remove={remove} />
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
