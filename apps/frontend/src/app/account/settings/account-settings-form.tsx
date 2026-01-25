"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UpdateAccountDtoSchema, type UpdateAccountDto } from "@/api/dtos";
import { SubmitButton } from "@/components/buttons";
import { TextInput } from "@/components/forms";
import { FormProvider } from "@/components/forms/form-provider";
import { useAuth, useUpdateAccount } from "@/hooks";
import { format } from "date-fns";
import { handleFormErrors } from "@/utilities/form";

export function AccountSettingsForm() {
  const { user, refreshUser } = useAuth();

  const { mutate: updateAccount, isPending } = useUpdateAccount();

  const form = useForm<UpdateAccountDto>({
    resolver: zodResolver(UpdateAccountDtoSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    updateAccount({ variables: values } as any, {
      onSuccess: async () => {
        await refreshUser();
        toast.success("Account updated");
      },
      onError: (error) => {
        handleFormErrors(form, error);
        toast.error("Failed to update account");
      },
    });
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <TextInput
          name="fullName"
          label="Full name"
          placeholder="Your full name"
        />
        <TextInput
          name="email"
          label="Email"
          placeholder="you@example.com"
          disabled
        />

        <TextInput
          name="createdAt"
          label="Joined date"
          value={user?.createdAt ? format(new Date(user.createdAt), "PPP") : ""}
          disabled
        />

        <div className="flex justify-end pt-2">
          <SubmitButton
            isLoading={isPending}
            className="bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
          >
            Save
          </SubmitButton>
        </div>
      </div>
    </FormProvider>
  );
}
