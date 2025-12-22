import { forwardRef } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup as ShadcnRadioGroup } from '@/components/ui/radio-group';
import { useForm } from './form-provider';

export interface RadioGroupProps
  extends Omit<React.ComponentProps<typeof ShadcnRadioGroup>, 'value' | 'onValueChange'> {
  name: string;
  label?: string;
  description?: string;
  error?: string;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ name, label, description, error, children, ...props }, ref) => {
    const form = useForm();
    const inputProps = form.getInputProps(name);

    const radioGroupElement = (
      <ShadcnRadioGroup
        ref={ref}
        value={inputProps.value || ''}
        onValueChange={(value) => form.form.setValue(name as any, value as any)}
        {...props}
      >
        {children}
      </ShadcnRadioGroup>
    );

    if (!label && !description && !error) {
      return <div key={form.key(name)}>{radioGroupElement}</div>;
    }

    return (
      <FormItem key={form.key(name)}>
        {label && <FormLabel>{label}</FormLabel>}
        <FormControl>{radioGroupElement}</FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
