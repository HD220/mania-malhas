"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import {
  UsePartnerFormProps,
  usePartnerForm,
} from "@/components/forms/partner-form/usePartnerForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { formatterPhoneNumber } from "@/utils";

export function PartnerForm({ initialValues, onSubmit }: UsePartnerFormProps) {
  const { form, submit } = usePartnerForm({
    initialValues,
    onSubmit,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar cliente</CardTitle>
            <CardDescription>
              Informe os dados do cliente e clique em salvar para finalizar
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
                    placeholder="ex: Fulano de tal."
                    className="flex-1"
                    {...field}
                  />
                )}
              />
              <FormField
                name="phone"
                control={form.control}
                render={({ field: { value, onChange, ...field } }) => (
                  <InputField
                    label="Telefone"
                    placeholder="(99) 9 9999-9999"
                    // pattern="[0-9]{2} [0-9]{1} [0-9]{4}-[0-9]{4}"
                    type="tel"
                    className="basis-1/5"
                    onChance={(ev) => {
                      let value = ev.target.value.replace(/\D/g, "");
                      if (value.length <= 11) form.setValue("phone", value);
                    }}
                    value={(() => {
                      return formatterPhoneNumber(value || "");
                    })()}
                    {...field}
                  />
                )}
              />
            </div>
            <div className="flex flex-1 gap-2 flex-col sm:flex-row">
              <FormField
                name="notes"
                control={form.control}
                render={({ field: { value = "", ...field } }) => (
                  <FormItem className="flex flex-1 flex-col">
                    <FormLabel htmlFor="notes">Anotações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ex: Informações sobre o cliente."
                        className="px-3 py-2"
                        rows={15}
                        value={value === null ? "" : value}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-end">
            <FormField
              name="active"
              control={form.control}
              render={({ field: { value, ...rest } }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={value === undefined ? true : value}
                    onCheckedChange={rest.onChange}
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ativo?
                  </label>
                </div>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Salvar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
