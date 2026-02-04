import { z } from 'zod';

// DTO for updating basic account information
export const UpdateAccountDtoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
});

export type UpdateAccountDto = z.infer<typeof UpdateAccountDtoSchema>;

// DTO for changing password
export const ChangePasswordDtoSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(8, 'Please confirm the new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
