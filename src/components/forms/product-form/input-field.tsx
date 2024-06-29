import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

export type InputFieldProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { className, label = "", placeholder = "", disabled = false, ...field },
    ref
  ) => {
    return (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            {...field}
            ref={ref}
            placeholder={placeholder}
            disabled={disabled}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);
InputField.displayName = "InputField";

export { InputField };
