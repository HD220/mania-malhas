import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { forwardRef } from "react";

export type InputFieldProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  unit?: string;
};

const InputMoneyField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      label = "",
      placeholder = "",
      disabled = false,
      unit = "R$",
      ...field
    },
    ref
  ) => {
    return (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <Card className="flex">
          <span className="p-2 bg-muted">{unit}</span>
          <FormControl>
            <Input
              {...field}
              ref={ref}
              type="number"
              step="0.01"
              disabled={disabled}
              pattern="^d+(.d{1,2})?$"
              placeholder={placeholder}
              className="flex-1 rounded-l-none border-0 border-l"
            />
          </FormControl>
        </Card>
        <FormMessage />
      </FormItem>
    );
  }
);
InputMoneyField.displayName = "InputMoneyField";

export { InputMoneyField };
