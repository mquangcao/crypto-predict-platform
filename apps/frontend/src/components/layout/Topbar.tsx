"use client";

import { useAuth } from "@/hooks";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, User as UserIcon } from "lucide-react";

export function Topbar() {
  const { user, isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="md:hidden text-lg font-semibold">
            <span className="text-indigo-500">Crypto</span>Lab
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Logo mobile */}
        <div className="md:hidden text-lg font-semibold">
          <span className="text-indigo-500">Crypto</span>Lab
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Market Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900"
            >
              {user?.role === "ADMIN" ? (
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
              ) : (
                <UserIcon className="h-4 w-4 text-emerald-600" />
              )}
              <span className="text-xs font-semibold tracking-wide uppercase">
                {user?.role || "Basic"}
              </span>
            </Button>
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-lg shadow-indigo-500/20"
            >
              <Link href="/register">Tham gia ngay</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
