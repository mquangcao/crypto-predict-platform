"use client";

import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-100 px-4"
      data-theme="light"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Crypto Platform
          </h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-gray-900">
          <LoginForm />

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2025 Crypto Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
