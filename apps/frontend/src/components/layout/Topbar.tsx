"use client";

import { useAuth } from "@/hooks";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, User as UserIcon, Crown } from "lucide-react";
import { NavTabs, type NavTabItem } from "@/components/nav-tabs";
import { Divider } from "@/components/divider";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const navItems: NavTabItem[] = [
  { label: "Market", path: "/" },
  { label: "News", path: "/news" },
  { label: "Pricing", path: "/pricing" },
];

export function Topbar() {
  const { user, isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <header className="h-16 border-b border-slate-200/60 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm shadow-slate-200/40">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-slate-200/60 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm shadow-slate-200/40">
      <div className="flex items-center gap-3">
        <Logo />
      </div>

      <div className="flex items-center gap-5 md:gap-8">
        <div className="hidden lg:flex items-center">
          <NavTabs items={navItems} />
        </div>

        <Divider
          orientation="vertical"
          variant="line"
          height="24px"
          className="hidden md:block opacity-60"
        />

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {/* Premium Role Badge */}
              <div
                className={cn(
                  "hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 shadow-xs",
                  user?.role === "ADMIN"
                    ? "bg-indigo-100/50 border-indigo-200 text-indigo-800 shadow-indigo-200/20"
                    : user?.role === "VIP"
                      ? "bg-amber-100/50 border-amber-200 text-amber-800 shadow-amber-100/20"
                      : "bg-slate-100/50 border-slate-200 text-slate-700 shadow-slate-200/20",
                )}
              >
                <div
                  className={cn(
                    "p-1 rounded-full flex items-center justify-center",
                    user?.role === "ADMIN"
                      ? "bg-indigo-200/50"
                      : user?.role === "VIP"
                        ? "bg-amber-200/50"
                        : "bg-slate-200/50",
                  )}
                >
                  {user?.role === "ADMIN" ? (
                    <ShieldCheck size={12} strokeWidth={3} />
                  ) : user?.role === "VIP" ? (
                    <Crown size={12} strokeWidth={3} />
                  ) : (
                    <UserIcon size={12} strokeWidth={3} />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                  {user?.role || "BASIC"}
                </span>
              </div>
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-indigo-600 hover:bg-linear-to-r from-indigo-600 to-violet-600 text-white border-none shadow-md shadow-indigo-200 transition-all font-bold rounded-lg px-5 hover:scale-[1.02]"
              >
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
