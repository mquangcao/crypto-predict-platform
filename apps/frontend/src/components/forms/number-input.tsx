import { forwardRef } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from './form-provider';

export interface NumberInputProps
  extends Omit<
    React.ComponentProps<'input'>,
    'checked' | 'value' | 'error' | 'onFocus' | 'onBlur' | 'type'
  > {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ name, label, description, error, className, min, max, step, ...props }, ref) => {
    const form = useForm();
    const inputProps = form.getInputProps(name);

    if (!label && !description && !error) {
      return (
        <Input
          ref={ref}
          key={form.key(name)}
          type="number"
          min={min}
          max={max}
          step={step}
          className={className}
          {...props}
          {...inputProps}
        />
      );
    }

    return (
      <FormItem key={form.key(name)}>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>
          <Input
            ref={ref}
            type="number"
            min={min}
            max={max}
            step={step}
            className={className}
            {...props}
            {...inputProps}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
    );
  }
);

NumberInput.displayName = 'NumberInput';
