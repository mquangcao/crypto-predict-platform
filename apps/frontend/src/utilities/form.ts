import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

export function handleFormErrors(form: UseFormReturn<any>, errors: unknown) {
  if (!errors || typeof errors !== 'object') {
    return;
  }

  if ('formErrors' in errors && Array.isArray(errors.formErrors)) {
    errors.formErrors.forEach((error) => {
      toast.error(error);
    });
  }

  if ('fieldErrors' in errors && typeof errors.fieldErrors === 'object' && errors.fieldErrors) {
    Object.entries(errors.fieldErrors).forEach(([fieldName, fieldErrors]) => {
      form.setError(fieldName as any, {
        type: 'manual',
        message: Array.isArray(fieldErrors) ? fieldErrors.join(', ') : String(fieldErrors),
      });
    });
  }
}
