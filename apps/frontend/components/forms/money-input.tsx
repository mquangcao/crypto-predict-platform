import { forwardRef } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useForm } from './form-provider';

export interface MoneyInputProps
  extends Omit<
    React.ComponentProps<'input'>,
    'checked' | 'value' | 'error' | 'onFocus' | 'onBlur' | 'type'
  > {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ name, label, description, error, prefix = '$', suffix, className, ...props }, ref) => {
    const form = useForm();
    const inputProps = form.getInputProps(name);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9.]/g, '');
      form.form.setValue(name as any, value as any);
    };

    const displayValue = inputProps.value ? `${prefix}${inputProps.value}${suffix || ''}` : '';

    const inputElement = (
      <Input
        ref={ref}
        type="text"
        className={cn(className)}
        {...props}
        value={displayValue}
        onChange={handleChange}
        aria-invalid={inputProps['aria-invalid']}
      />
    );

    if (!label && !description && !error) {
      return <div key={form.key(name)}>{inputElement}</div>;
    }

    return (
      <FormItem key={form.key(name)}>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>{inputElement}</FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
