"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const subTextSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-3 transition-all duration-300",
        className,
      )}
    >
      {/* "The Prism Block" Icon - Minimal, Sharp, Meaningful */}
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          iconSizes[size],
        )}
      >
        {/* Geometric Base */}
        <div className="absolute inset-0 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors duration-500" />

        {/* The "Lab Insight" Glyph: A stylized block with a precision cut */}
        <div className="relative w-[60%] h-[60%]">
          {/* Top segment */}
          <div className="absolute top-0 right-0 w-[70%] h-[40%] bg-indigo-600 rounded-[2px] transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

          {/* Main segment */}
          <div className="absolute bottom-0 left-0 w-[70%] h-[70%] bg-slate-900 rounded-[2px] transition-all duration-500 group-hover:bg-indigo-700" />

          {/* Connecting "Pulse" dot */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse group-hover:scale-150 transition-transform" />
        </div>
      </div>

      {/* Elegant Architectural Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span
            className={cn(
              "font-black text-slate-900 tracking-tighter transition-colors",
              textSizes[size],
            )}
          >
            CRYPTO
          </span>
          <span
            className={cn(
              "font-extralight text-indigo-600 ml-1 tracking-widest uppercase transition-all duration-300 group-hover:tracking-[0.3em]",
              subTextSizes[size],
            )}
          >
            Lab
          </span>
        </div>
        {/* A tiny subtitle for that "Established" look */}
        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-0.5 group-hover:text-indigo-400 transition-colors">
          Intelligence
        </span>
      </div>
    </Link>
  );
}
