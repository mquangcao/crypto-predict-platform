"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  FormProvider,
  TextInput,
  PasswordInput,
  Checkbox,
} from "@/components/forms";
import { SubmitButton } from "@/components/buttons";

// Simple form schema that matches the UI
const LoginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  async function handleSubmit(data: LoginFormValues) {
    setLoading(true);
    try {
      console.log("Login submit:", data);
      await new Promise((r) => setTimeout(r, 500));
      alert("Mock login thành công (chưa nối backend)");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <TextInput
          name="email"
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
        />

        <PasswordInput
          name="password"
          label="Mật khẩu"
          required
          minLength={6}
          placeholder="••••••••"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Checkbox
            name="remember"
            label="Remember me"
            className="text-sm select-none"
            disabled={loading}
          />
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton isLoading={loading} className="w-full mt-2">
          Đăng nhập
        </SubmitButton>
      </form>
    </FormProvider>
  );
}
