import { forwardRef } from 'react';
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from './form-provider';

export interface CheckboxProps
  extends Omit<
    React.ComponentProps<typeof ShadcnCheckbox>,
    'checked' | 'value' | 'error' | 'onFocus' | 'onBlur'
  > {
  name: string;
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ name, label, description, error, ...props }, ref) => {
    const form = useForm();
    const inputProps = form.getInputProps(name, { type: 'checkbox' });

    if (!label && !description && !error) {
      return <ShadcnCheckbox ref={ref} key={form.key(name)} {...props} {...inputProps} />;
    }

    return (
      <FormItem key={form.key(name)} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FormControl>
            <ShadcnCheckbox ref={ref} {...props} {...inputProps} className="hover:cursor-pointer" />
          </FormControl>
          {label && (
            <FormLabel className="cursor-pointer font-normal m-0! leading-4! peer-disabled:cursor-not-allowed peer-disabled:opacity-70 whitespace-nowrap">
              {label}
            </FormLabel>
          )}
        </div>
        <div className="flex flex-col gap-1 ml-6">
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error}</FormMessage>}
        </div>
      </FormItem>
    );
  }
);

Checkbox.displayName = 'Checkbox';
