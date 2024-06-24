import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export type InputFieldProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function InputField({
  className,
  label = "",
  placeholder = "",
  disabled = false,
  ...field
}: InputFieldProps) {
  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input {...field} placeholder={placeholder} disabled={disabled} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
