"use client";

import { useState } from "react";
import { Check, ArrowRight, Minus, Shield, Zap } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Standard",
      price: "0",
      description: "Foundational tools for market exploration.",
      features: [
        "Real-time technical charts",
        "Market news aggregator",
        "Standard data latency",
        "Email support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "VIP Premium",
      price: isYearly ? "360.000" : "36.000",
      period: isYearly ? "per year" : "per month",
      description: "Advanced intelligence for professional edge.",
      features: [
        "Proprietary AI model analysis",
        "Actionable trade signals",
        "Advanced technical indicators",
        "Real-time price alerts",
        "Weekly market intelligence reports",
        "Zero-ads experience",
      ],
      cta: "Go Premium",
      highlighted: true,
      tag: "Recommended",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <Topbar />

      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 py-20">
        {/* Simple Typography Header */}
        <div className="space-y-4 mb-20">
          <p className="text-indigo-600 font-bold tracking-widest uppercase text-[11px]">
            Pricing & Plans
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
            Professional tools. <br />
            <span className="text-slate-400">Straightforward pricing.</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-xl font-medium pt-2 text-balance">
            Choose the plan that fits your trading style. No hidden fees, just
            pure data intelligence.
          </p>
        </div>

        {/* Minimalist Switch */}
        <div className="flex items-center gap-4 mb-12 border-b border-slate-200 pb-12">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "text-sm font-bold transition-all px-5 py-2.5 rounded-xl border",
              !isYearly
                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20"
                : "border-slate-200 bg-transparent text-slate-400 hover:text-slate-600 hover:border-slate-400",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "text-sm font-bold transition-all px-5 py-2.5 rounded-xl border flex items-center gap-2",
              isYearly
                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20"
                : "border-slate-200 bg-transparent text-slate-400 hover:text-slate-600 hover:border-slate-400",
            )}
          >
            Yearly
            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
              Save 20%
            </span>
          </button>
        </div>

        {/* Pricing Layout - Distinct Card Containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col p-10 md:p-14 rounded-[3.5rem] transition-all duration-700 bg-white",
                plan.highlighted
                  ? "ring-2 ring-indigo-600 shadow-[0_32px_64px_-16px_rgba(79,70,229,0.15)] z-10"
                  : "border border-slate-200 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]",
              )}
            >
              <div className="space-y-8 flex-1">
                <div className="flex items-center justify-between">
                  <h3
                    className={cn(
                      "text-sm font-black uppercase tracking-[0.2em]",
                      plan.highlighted ? "text-indigo-600" : "text-slate-900",
                    )}
                  >
                    {plan.name}
                  </h3>
                  {plan.tag && (
                    <span className="text-[10px] font-black bg-indigo-600 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">
                      {plan.tag}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-7xl md:text-8xl font-black tracking-tighter text-slate-950">
                    {plan.price}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-950 uppercase leading-none">
                      vnd
                    </span>
                    {plan.period && (
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-500 font-medium text-lg leading-relaxed min-h-[60px]">
                  {plan.description}
                </p>

                <div className="pt-10 space-y-6">
                  <p className="text-[11px] font-black uppercase text-slate-950 tracking-[0.2em] flex items-center gap-2 opacity-30">
                    <Minus size={14} strokeWidth={4} /> What&apos;s included
                  </p>
                  <ul className="space-y-5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-1 rounded-full shrink-0 mt-0.5",
                            plan.highlighted ? "bg-indigo-50" : "bg-slate-50",
                          )}
                        >
                          <Check
                            size={14}
                            className={
                              plan.highlighted
                                ? "text-indigo-600"
                                : "text-slate-900"
                            }
                            strokeWidth={4}
                          />
                        </div>
                        <span className="text-[16px] font-bold text-slate-900 leading-tight">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-14">
                <Button
                  asChild
                  className={cn(
                    "w-full h-16 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-xl",
                    plan.highlighted
                      ? "bg-indigo-600 hover:bg-slate-950 text-white shadow-indigo-200/60 hover:-translate-y-1 hover:scale-[1.02]"
                      : "bg-slate-950 text-white hover:bg-indigo-600 shadow-slate-200 hover:-translate-y-1 hover:scale-[1.02]",
                  )}
                >
                  <Link
                    href="/register"
                    className="flex items-center gap-2 justify-center"
                  >
                    {plan.cta} <ArrowRight size={18} strokeWidth={3} />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 bg-slate-50 border-t border-slate-100 mt-20">
        <div className="max-w-6xl mx-auto w-full px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Support
            </Link>
          </div>
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em]">
            CryptoLab Global Ecosystem © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
