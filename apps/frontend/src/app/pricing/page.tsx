"use client";

import { useState } from "react";
import { Check, ArrowRight, Minus } from "lucide-react";
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
      href: "/",
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
      href: "/checkout",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12 md:py-16">
        {/* Compact Typography Header */}
        <div className="space-y-3 mb-12">
          <p className="text-indigo-600 font-bold tracking-widest uppercase text-[10px]">
            Pricing & Plans
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Professional tools. <br />
            <span className="text-slate-400">Straightforward pricing.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-lg font-medium pt-1 text-balance">
            Choose the plan that fits your trading style. No hidden fees, just
            pure data intelligence.
          </p>
        </div>

        {/* Minimalist Switch - Smaller */}
        <div className="flex items-center gap-3 mb-10 border-b border-slate-200 pb-10">
          <button
            onClick={() => setIsYearly(false)}
            className={cn(
              "text-xs font-bold transition-all px-4 py-2 rounded-lg border",
              !isYearly
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                : "border-slate-200 bg-transparent text-slate-400 hover:text-slate-600 hover:border-slate-400",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={cn(
              "text-xs font-bold transition-all px-4 py-2 rounded-lg border flex items-center gap-2",
              isYearly
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                : "border-slate-200 bg-transparent text-slate-400 hover:text-slate-600 hover:border-slate-400",
            )}
          >
            Yearly
            <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
              Save 20%
            </span>
          </button>
        </div>

        {/* Pricing Layout - Compact Carbon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col p-8 md:py-14 md:px-10 rounded-[2.5rem] transition-all duration-500 bg-white",
                plan.highlighted
                  ? "ring-1 ring-indigo-600 shadow-[0_20px_40px_-8px_rgba(79,70,229,0.12)] z-10"
                  : "border border-slate-200 shadow-sm hover:shadow-md",
              )}
            >
              <div className="space-y-6 flex-1">
                <div className="flex items-center justify-between">
                  <h3
                    className={cn(
                      "text-xs font-black uppercase tracking-[0.15em]",
                      plan.highlighted ? "text-indigo-600" : "text-slate-900",
                    )}
                  >
                    {plan.name}
                  </h3>
                  {plan.tag && (
                    <span className="text-[9px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200/20">
                      {plan.tag}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl md:text-6xl font-black tracking-tighter text-slate-950">
                    {plan.price}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-950 uppercase leading-none">
                      vnd
                    </span>
                    {plan.period && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
                  {plan.description}
                </p>

                <div className="pt-6 space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-950 tracking-[0.15em] flex items-center gap-2 opacity-30">
                    <Minus size={12} strokeWidth={4} /> What&apos;s included
                  </p>
                  <ul className="space-y-3.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-1 rounded-full shrink-0 mt-0.5",
                            plan.highlighted ? "bg-indigo-50" : "bg-slate-50",
                          )}
                        >
                          <Check
                            size={12}
                            className={
                              plan.highlighted
                                ? "text-indigo-600"
                                : "text-slate-900"
                            }
                            strokeWidth={4}
                          />
                        </div>
                        <span className="text-[14px] font-bold text-slate-800 leading-tight">
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
                    "w-full h-14 rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-lg",
                    plan.highlighted
                      ? "bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-100/50 hover:-translate-y-1"
                      : "bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200 hover:-translate-y-1",
                  )}
                >
                  <Link
                    href={
                      plan.highlighted
                        ? `${plan.href}?period=${isYearly ? "yearly" : "monthly"}`
                        : plan.href
                    }
                    className="flex items-center gap-2 justify-center"
                  >
                    {plan.cta} <ArrowRight size={16} strokeWidth={3} />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
