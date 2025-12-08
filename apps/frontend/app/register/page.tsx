"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      alert("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    try {
      // TODO: sau này gọi auth-service:
      // const res = await fetch("http://localhost:4001/auth/register", { ... })
      console.log("Register submit:", { email, password });
      await new Promise((r) => setTimeout(r, 500));
      alert("Mock register thành công (chưa nối backend)");
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
            Tạo tài khoản để sử dụng đầy đủ tính năng.
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

          <div className="space-y-1">
            <label
              htmlFor="confirm"
              className="text-xs font-medium text-slate-300"
            >
              Nhập lại mật khẩu
            </label>
            <input
              id="confirm"
              name="confirm"
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
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
