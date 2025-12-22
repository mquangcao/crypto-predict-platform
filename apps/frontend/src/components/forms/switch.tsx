import { forwardRef } from 'react';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch as ShadcnSwitch } from '@/components/ui/switch';
import { useForm } from './form-provider';

export interface SwitchProps
  extends Omit<
    React.ComponentProps<typeof ShadcnSwitch>,
    'checked' | 'value' | 'error' | 'onFocus' | 'onBlur'
  > {
  name: string;
  label?: string;
  description?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ name, label, description, error, ...props }, ref) => {
    const form = useForm();
    const inputProps = form.getInputProps(name, { type: 'checkbox' });

    if (!label && !description && !error) {
      return <ShadcnSwitch ref={ref} key={form.key(name)} {...props} {...inputProps} />;
    }

    return (
      <FormItem
        key={form.key(name)}
        className="flex flex-row items-center justify-between space-x-3 space-y-0"
      >
        <div className="space-y-0.5">
          {label && <FormLabel>{label}</FormLabel>}
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormControl>
          <ShadcnSwitch ref={ref} {...props} {...inputProps} />
        </FormControl>
        {error && <FormMessage>{error}</FormMessage>}
      </FormItem>
    );
  }
);

Switch.displayName = 'Switch';
