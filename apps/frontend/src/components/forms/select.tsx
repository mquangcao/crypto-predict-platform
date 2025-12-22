import { forwardRef } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadcnSelect,
} from '@/components/ui/select';
import { useForm } from './form-provider';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.ComponentProps<typeof ShadcnSelect>, 'value' | 'onValueChange'> {
  name: string;
  data?: SelectOption[];
  placeholder?: string;
  label?: string;
  description?: string;
  error?: string;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ name, data = [], placeholder, label, description, error, ...props }, ref) => {
    const form = useForm();
    const inputProps = form.getInputProps(name);

    const selectElement = (
      <ShadcnSelect
        value={inputProps.value || ''}
        onValueChange={(value) => form.form.setValue(name as any, value as any)}
        {...props}
      >
        <SelectTrigger ref={ref} aria-invalid={inputProps['aria-invalid']}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
    );

    if (!label && !description && !error) {
      return <div key={form.key(name)}>{selectElement}</div>;
    }

    return (
      <FormItem key={form.key(name)}>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>{selectElement}</FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
    );
  }
);

Select.displayName = 'Select';
