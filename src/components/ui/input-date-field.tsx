import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { forwardRef, useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { format, parse } from "date-fns";

export type InputFieldProps = InputProps & {
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const InputDateField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { className, label = "", placeholder = "", type = "text", ...field },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const curRef = inputRef.current;
      if (curRef) {
        inputRef.current.addEventListener("focusin", () => {
          console.log("focus-in");
          setFocused(true);
        });
        inputRef.current.addEventListener("focusout", () => {
          console.log("focus-out");
          setFocused(false);
        });
      }

      return () => {
        curRef?.removeEventListener("focusin", () => {
          console.log("focus-in-destroy");
        });
        curRef?.removeEventListener("focusout", () => {
          console.log("focus-out-destroy");
        });
      };
    }, []);

    console.log("focused:", focused);

    return (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <Card
          className={cn(
            "flex items-center pr-1 ",
            focused &&
              "ring-offset-background outline-none ring-2 ring-ring ring-offset-0 border-none"
          )}
        >
          <FormControl>
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              className="flex-1 border-none focus-visible:ring-offset-0 focus-visible:ring-0"
              {...field}
            />
          </FormControl>
          <Popover>
            <PopoverTrigger>
              <CalendarIcon className="h-6 w-6" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={inputRef.current?.valueAsDate ?? undefined}
                onSelect={(e) => {
                  console.log(e);

                  if (inputRef.current && e)
                    inputRef.current.value = format(e, "dd/MM/yyyy");
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </Card>
        <FormMessage />
      </FormItem>
    );
  }
);
InputDateField.displayName = "InputDateField";

export { InputDateField };
