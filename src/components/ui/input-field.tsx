import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChangeEventHandler, HTMLInputTypeAttribute, forwardRef } from "react";

export type InputFieldProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  pattern?: string;
  type?: HTMLInputTypeAttribute;
  value?: string;
  onChance?: ChangeEventHandler<HTMLInputElement>;
};

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      label = "",
      placeholder = "",
      disabled = false,
      pattern,
      type,
      onChance,
      value,
      ...field
    },
    ref
  ) => {
    return (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            ref={ref}
            placeholder={placeholder}
            disabled={disabled}
            pattern={pattern}
            type={type || "text"}
            onChange={onChance}
            value={value}
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
);
InputField.displayName = "InputField";

export { InputField };
