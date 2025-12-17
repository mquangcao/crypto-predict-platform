import { forwardRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export interface PasswordInputProps
  extends Omit<
    React.ComponentProps<'input'>,
    'checked' | 'value' | 'error' | 'onFocus' | 'onBlur' | 'type'
  > {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ name, label, description, error, required, className, id, ...props }, ref) => {
    const form = useForm();
    const inputProps = form.getInputProps(name);
    const [showPassword, setShowPassword] = useState(false);
    const fieldError = form.form.formState.errors[name]?.message as string | undefined;
    const displayError = error || fieldError;
    const inputId = id || `password-input-${name}`;

    const inputElement = (
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          required={required}
          {...props}
          {...inputProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
        </Button>
      </div>
    );

    if (!label && !description && !displayError) {
      return <div key={form.key(name)}>{inputElement}</div>;
    }

    return (
      <FormItem key={form.key(name)}>
        {label && (
          <FormLabel htmlFor={inputId}>
            {label}
            {required && <span className="text-destructive -ml-1">*</span>}
          </FormLabel>
        )}
        <FormControl>{inputElement}</FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        {displayError && <FormMessage>{displayError}</FormMessage>}
      </FormItem>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
