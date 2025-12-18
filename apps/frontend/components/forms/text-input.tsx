import { forwardRef } from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "./form-provider";

export interface TextInputProps extends Omit<
  React.ComponentProps<"input">,
  "checked" | "value" | "error" | "onFocus" | "onBlur"
> {
  name: string;
  label?: React.ReactNode;
  description?: string;
  error?: string;
  required?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    { name, label, description, error, required, className, id, ...props },
    ref
  ) => {
    const form = useForm();
    const inputProps = form.getInputProps(name);
    const fieldError = form.form.formState.errors[name]?.message as
      | string
      | undefined;
    const displayError = error || fieldError;
    const inputId = id || `text-input-${name}`;

    if (!label && !description && !displayError) {
      return (
        <Input
          ref={ref}
          id={inputId}
          key={form.key(name)}
          className={className}
          required={required}
          {...props}
          {...inputProps}
        />
      );
    }

    return (
      <FormItem key={form.key(name)}>
        {label && (
          <FormLabel
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 block"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
        )}
        <FormControl>
          <Input
            ref={ref}
            id={inputId}
            className={className}
            required={required}
            {...props}
            {...inputProps}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {displayError && <FormMessage>{displayError}</FormMessage>}
      </FormItem>
    );
  }
);

TextInput.displayName = "TextInput";
