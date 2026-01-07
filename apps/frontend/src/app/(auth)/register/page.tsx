import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="lg:col-span-3 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          <p className="text-slate-500 text-sm mt-1">
            Sign up to get started with your portfolio.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
