"use client";

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
import { useAuth, useRegister } from "@/hooks";

// Form schema
const RegisterFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  agreeToTerms: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must agree to the terms and privacy policy"
    ),
});

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const { setIsAuthenticated, refreshUser } = useAuth();
  const { mutate: register, isPending } = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    register(
      {
        variables: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
        },
      } as any,
      {
        onSuccess: () => {
          setIsAuthenticated(true);
          refreshUser();
          onSuccess?.();
        },
      }
    );
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <FormProvider form={form} onSubmit={handleSubmit} className="space-y-5">
        <TextInput
          name="fullName"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          disabled={isPending}
          required
          className="peer block w-full pl-4 pr-10 py-3 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
        />

        <TextInput
          name="email"
          label="Email address"
          type="email"
          placeholder="name@company.com"
          disabled={isPending}
          required
          className="peer block w-full pl-4 pr-10 py-3 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
        />

        <PasswordInput
          name="password"
          label="Password"
          placeholder="Create a password (min. 6 characters)"
          disabled={isPending}
          required
          className="peer block w-full pl-4 pr-11 py-3 bg-slate-50 border-0 ring-1 ring-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
        />

        <Checkbox
          name="agreeToTerms"
          label={
            <span className="text-slate-500">
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </span>
          }
          disabled={isPending}
          className="text-sm mt-2"
        />

        <SubmitButton
          isLoading={isPending}
          className="group w-full flex justify-center items-center py-7! px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Create Account
        </SubmitButton>
      </FormProvider>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-slate-400 font-medium whitespace-nowrap">
            OR
          </span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Already have an account?
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
