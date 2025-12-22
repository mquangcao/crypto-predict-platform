import { createContext, useContext } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import invariant from "tiny-invariant";
import { Form } from "@/components/ui/form";

interface FormAdapter<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  key: (name: string) => string;
  getInputProps: (name: string, options?: { type?: "checkbox" }) => any;
}

type FormContextValues = FormAdapter<any>;

interface FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
> extends Omit<React.ComponentProps<"form">, "form"> {
  form: UseFormReturn<TFieldValues>;
}

const FormContext = createContext<FormContextValues | null>(null);

export function useForm<TFieldValues extends FieldValues = FieldValues>() {
  const context = useContext(FormContext);
  invariant(context, "useForm must be used within FormProvider");
  return context as FormAdapter<TFieldValues>;
}

export function FormProvider<TFieldValues extends FieldValues = FieldValues>({
  children,
  form,
  ...props
}: FormProviderProps<TFieldValues>) {
  const adapter: FormAdapter<TFieldValues> = {
    form,
    key: (name: string) => name,
    getInputProps: (name: string, options?: { type?: "checkbox" }) => {
      const field = form.register(name as any);
      const error = form.formState.errors[name];

      if (options?.type === "checkbox") {
        return {
          ...field,
          checked: form.watch(name as any) || false,
          onCheckedChange: (checked: boolean) =>
            form.setValue(name as any, checked as any),
          "aria-invalid": !!error,
        };
      }

      return {
        ...field,
        error: error?.message as string | undefined,
        "aria-invalid": !!error,
      };
    },
  };

  return (
    <FormContext.Provider value={adapter}>
      <Form {...form}>
        <form {...props}>{children}</form>
      </Form>
    </FormContext.Provider>
  );
}
