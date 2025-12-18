import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="lg:col-span-3 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
      <div className="max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 text-sm mt-1">
            Please enter your details to sign in.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
