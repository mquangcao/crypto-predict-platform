"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={cn(
        "font-bold tracking-tight text-slate-900 hover:opacity-90 transition-opacity flex items-center",
        sizeClasses[size],
        className,
      )}
    >
      <span className="text-indigo-600">Crypto</span>Lab
    </Link>
  );
}
