import { forwardRef } from "react";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "./form-provider";

export interface CheckboxProps extends Omit<
  React.ComponentProps<typeof ShadcnCheckbox>,
  "checked" | "value" | "error" | "onFocus" | "onBlur"
> {
  name: string;
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ name, label, description, error, ...props }, ref) => {
    const form = useForm();

    if (!label && !description && !error) {
      return (
        <FormField
          control={form.form.control}
          name={name}
          render={({ field }) => (
            <ShadcnCheckbox
              ref={ref}
              id={name}
              checked={field.value || false}
              onCheckedChange={field.onChange}
              {...props}
              className="hover:cursor-pointer"
            />
          )}
        />
      );
    }

    return (
      <FormField
        control={form.form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormControl>
                <ShadcnCheckbox
                  ref={ref}
                  id={name}
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                  {...props}
                  className="hover:cursor-pointer"
                />
              </FormControl>
              {label && (
                <FormLabel
                  htmlFor={name}
                  className="cursor-pointer font-normal m-0! leading-4! whitespace-nowrap"
                >
                  {label}
                </FormLabel>
              )}
            </div>
            <div className="flex flex-col gap-1 ml-6">
              {description && <FormDescription>{description}</FormDescription>}
              {error && <FormMessage>{error}</FormMessage>}
            </div>
          </FormItem>
        )}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
