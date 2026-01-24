"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SubmitButton } from "@/components/buttons";
import { PasswordInput } from "@/components/forms";
import { FormProvider } from "@/components/forms/form-provider";
import { useAuth, useChangePassword } from "@/hooks";
import { handleFormErrors } from "@/utilities/form";
import { ChangePasswordDto, ChangePasswordDtoSchema } from "@/api/dtos";

export function ChangePasswordForm() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const { logout } = useAuth();

  const form = useForm<ChangePasswordDto>({
    resolver: zodResolver(ChangePasswordDtoSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    // API expects currentPassword and newPassword only
    const payload = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    };

    changePassword({ variables: payload } as any, {
      onSuccess: () => {
        toast.success("Password changed");
        form.reset();
        // After password change, call logout to require re-authentication
        logout?.({
          onSuccess: () => {
            /* noop - navigation handled by AuthProvider */
          },
        });
      },
      onError: (error) => {
        handleFormErrors(form, error);
        toast.error(error.message);
      },
    });
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <PasswordInput
          name="currentPassword"
          label="Current password"
          required
        />
        <PasswordInput name="newPassword" label="New password" required />
        <PasswordInput
          name="confirmNewPassword"
          label="Confirm new password"
          required
        />

        <div className="flex justify-end">
          <SubmitButton
            isLoading={isPending}
            className="bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
          >
            Change password
          </SubmitButton>
        </div>
      </div>
    </FormProvider>
  );
}
