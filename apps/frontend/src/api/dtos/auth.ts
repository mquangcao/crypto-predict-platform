import { z } from 'zod';
import { BaseResponseSchema } from '../common';

export const AuthMethodSchema = z.enum(['password', 'openid']);

export const LoginRequestSchema = z.object({
  method: AuthMethodSchema,
  data: z
    .object({
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.username) {
          return !!data.password;
        }
        return true;
      },
      { message: 'Password is required when username or email is provided' }
    ),
});

export const TokenRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'BASIC', 'GUEST']);

export const LoginResponseSchema = BaseResponseSchema(
  z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    token_role: TokenRoleSchema,
    expires_in: z.number(),
  })
);

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string(),
});

export const UserRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'BASIC', 'ANONYMOUS', 'SYSTEM']);

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
});

export type AuthMethod = z.infer<typeof AuthMethodSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type TokenRole = z.infer<typeof TokenRoleSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
