"use client";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-100 px-4"
      data-theme="light"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create an account
          </h1>
          <p className="text-gray-600">
            Get started with your free account today.
          </p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-gray-900">
          <RegisterForm />
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
