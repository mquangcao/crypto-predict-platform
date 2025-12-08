"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setLoading(true);
    try {
      // TODO: sau này gọi auth-service, ví dụ:
      // const res = await fetch("http://localhost:4001/auth/login", { ... })
      console.log("Login submit:", { email, password });
      await new Promise((r) => setTimeout(r, 500));
      alert("Mock login thành công (chưa nối backend)");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra (mock)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold mb-1">
            <span className="text-indigo-500">Crypto</span>Lab
          </div>
          <p className="text-xs text-slate-400">
            Đăng nhập để xem biểu đồ giá, tin tức và AI insight.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-300"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-2 text-sm font-medium text-white mt-2"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
