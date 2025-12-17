import { forwardRef } from "react";

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "./form-provider";
import { DatePicker } from "@/components/ui/date-picker";

export interface DatePickerInputProps extends Omit<
  React.ComponentProps<typeof DatePicker>,
  "value" | "onChange"
> {
  name: string;
  label?: string;
  description?: string;
  error?: string;
}

export const DatePickerInput = forwardRef<
  HTMLButtonElement,
  DatePickerInputProps
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ name, label, description, error, ...props }, ref) => {
  const form = useForm();
  const value = form.form.watch(name as any);

  const datePickerElement = (
    <DatePicker
      value={value || null}
      onChange={(date) => form.form.setValue(name as any, date as any)}
      {...props}
    />
  );

  if (!label && !description && !error) {
    return <div key={form.key(name)}>{datePickerElement}</div>;
  }

  return (
    <FormItem key={form.key(name)}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>{datePickerElement}</FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
});

DatePickerInput.displayName = "DatePickerInput";
