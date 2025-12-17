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
const RegisterFormSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
    agreeToTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must agree to the terms and privacy policy"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      // Transform form values to API format
      const variables = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      };

      console.log("Register submit:", variables);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Mock register thành công (chưa nối backend)");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit} className="space-y-4">
      <TextInput
        name="fullName"
        label="Full name"
        type="text"
        placeholder="Enter your full name"
        disabled={loading}
        required
      />

      <TextInput
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        disabled={loading}
        required
      />

      <PasswordInput
        name="password"
        label="Password"
        placeholder="Create a password (min. 6 characters)"
        disabled={loading}
        required
      />

      <PasswordInput
        name="confirmPassword"
        label="Confirm password"
        placeholder="Confirm your password"
        disabled={loading}
        required
      />

      <Checkbox
        name="agreeToTerms"
        label={
          <>
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Privacy Policy
            </Link>
          </>
        }
        disabled={loading}
        className="text-sm"
      />

      <SubmitButton isLoading={loading} className="w-full mt-2">
        Create account
      </SubmitButton>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </div>
    </FormProvider>
  );
}
