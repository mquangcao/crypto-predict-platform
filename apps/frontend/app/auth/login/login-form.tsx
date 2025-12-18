"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { FormProvider, TextInput, PasswordInput } from "@/components/forms";
import { SubmitButton } from "@/components/buttons";
import { SocialLoginButtons, socialData } from "./social-login-buttons";

// Simple form schema
const LoginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "user@example.com",
      password: "password123",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    console.log("Submitting login form with data:", data);
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log("Logged in");
    }, 1500);
  });

  const handleSocialLogin = (provider: "google" | "keycloak") => {
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="space-y-6">
      <FormProvider form={form} onSubmit={handleSubmit} className="space-y-5">
        <TextInput
          name="email"
          label="Email address"
          type="email"
          placeholder="name@company.com"
          className="peer block w-full pl-4 pr-10 py-3 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
        />

        <PasswordInput
          name="password"
          label={
            <div className="flex items-center justify-between w-full">
              <span>Password</span>
              <Link
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline normal-case tracking-normal"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
          }
          placeholder="••••••••"
          className="peer block w-full pl-4 pr-11 py-3 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
        />

        <SubmitButton
          isLoading={loading}
          className="group w-full flex justify-center items-center py-7! px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Log In
        </SubmitButton>
      </FormProvider>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-slate-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      <SocialLoginButtons
        providers={socialData}
        onSocialLogin={handleSocialLogin}
        disabled={loading}
      />

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          Don&apos;t have an account?
          <Link
            href="/auth/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
