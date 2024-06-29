"use client";

import { Form, FormField } from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropzoneProvider } from "@/components/providers/dropzone-provider";
import { InputField } from "@/components/forms/product-form/input-field";
import { InputMoneyField } from "@/components/forms/product-form/input-money-field";
import {
  UseProductFormProps,
  useProductForm,
} from "@/components/forms/product-form/useProductForm";
import { DropzoneImageCarousel } from "@/components/forms/product-form/dropzone-image-carousel";

export function ProductForm({ initialValues, onSubmit }: UseProductFormProps) {
  const { form, addImage, removeImage, submit } = useProductForm({
    initialValues,
    onSubmit,
  });

  return (
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
            <div className="flex flex-1 gap-2 flex-col sm:flex-row">
              <FormField
                name="id"
                control={form.control}
                render={({ field }) => (
                  <InputField
                    disabled={true}
                    label="Código"
                    placeholder={field.value?.toString() ?? "NOVO"}
                    className="basis-1/5"
                    {...field}
                  />
                )}
              />
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <InputField
                    label="Nome"
                    placeholder="ex: Calça Jeans."
                    className="flex-1"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="flex flex-1 gap-2 flex-col sm:flex-row">
              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <InputField
                    label="Descrição"
                    placeholder="ex: Calça jeans estilo surrada."
                    className="flex-1"
                    {...field}
                  />
                )}
              />
              <FormField
                name="price"
                control={form.control}
                render={({ field }) => (
                  <InputMoneyField
                    label="Preço"
                    className="basis-1/5"
                    {...field}
                  />
                )}
              />
            </div>
            <DropzoneProvider
              options={{
                noClick: true,
                noKeyboard: true,
                multiple: true,
                // accept: { "image/*": [] },
                onDrop: addImage,
              }}
            >
              <DropzoneImageCarousel
                multiple={true}
                onRemove={removeImage}
                files={form.watch("images")}
              />
            </DropzoneProvider>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">Salvar</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
