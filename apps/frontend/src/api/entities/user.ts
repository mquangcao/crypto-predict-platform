import { z } from "zod";

// User role enum to match backend
export const UserRoleSchema = z.enum(["ADMIN", "BASIC", "ANONYMOUS", "SYSTEM"]);

// User status enum matching backend
export const UserStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING",
]);

// User entity schema matching the backend API
export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
  username: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: UserRoleSchema,
  status: UserStatusSchema,
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;

// Backwards compatibility - export User as default export
export { UserSchema as User };
