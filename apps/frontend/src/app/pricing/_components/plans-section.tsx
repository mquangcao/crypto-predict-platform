"use client";

import { useState } from "react";
import { Check, ArrowRight, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useGetPlans } from "@/hooks";
import type { Plan } from "@/api/dtos";

export function PlansSection() {
  const [isYearly, setIsYearly] = useState(false);

  // Fetch plans from API
  const { data, isLoading, error } = useGetPlans();
  const plans = data?.data || [];

  // Helper function to get display price (with discount if available)
  const getDisplayPrice = (plan: Plan) => {
    if (isYearly) {
      const discount = plan.yearlyDiscountPrice;
      if (discount !== null && discount > 0) {
        // If discount is <= 1, treat as multiplier (e.g., 0.8 = 80% of original price)
        return discount <= 1 ? plan.yearlyPrice * discount : discount;
      }
      return plan.yearlyPrice;
    }
    const discount = plan.monthlyDiscountPrice;
    if (discount !== null && discount > 0) {
      return discount <= 1 ? plan.monthlyPrice * discount : discount;
    }
    return plan.monthlyPrice;
  };

  // Helper function to check if plan has discount
  const hasDiscount = (plan: Plan) => {
    if (isYearly) {
      return plan.yearlyDiscountPrice !== null && plan.yearlyDiscountPrice > 0;
    }
    return plan.monthlyDiscountPrice !== null && plan.monthlyDiscountPrice > 0;
  };

  // Helper function to get original price (for strikethrough)
  const getOriginalPrice = (plan: Plan) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Helper function to calculate max discount
  const getMaxDiscount = () => {
    if (!plans.length) return 0;
    const discounts = plans
      .filter((p) => p.yearlyDiscountPrice && p.yearlyDiscountPrice > 0)
      .map((p) => {
        const discount = p.yearlyDiscountPrice!;
        if (discount <= 1) {
          return Math.round((1 - discount) * 100);
        }
        return Math.round(((p.yearlyPrice - discount) / p.yearlyPrice) * 100);
      });
    return discounts.length ? Math.max(...discounts) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Failed to load pricing plans</p>
        <p className="text-slate-500 text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  if (plans.length === 0) return null;

  return (
    <>
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
          {getMaxDiscount() > 0 && (
            <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
              Save {getMaxDiscount()}%
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col p-8 md:py-14 md:px-10 rounded-[2.5rem] transition-all duration-500 bg-white",
              plan.isPopular
                ? "ring-1 ring-indigo-600 shadow-[0_20px_40px_-8px_rgba(79,70,229,0.12)] z-10"
                : "border border-slate-200 shadow-sm hover:shadow-md",
            )}
          >
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between">
                <h3
                  className={cn(
                    "text-xs font-black uppercase tracking-[0.15em]",
                    plan.isPopular ? "text-indigo-600" : "text-slate-900",
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

              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl md:text-6xl font-black tracking-tighter text-slate-950">
                      {formatPrice(getDisplayPrice(plan))}
                    </span>
                    <span className="text-sm font-black text-slate-950 uppercase">
                      vnd
                    </span>
                  </div>

                  {hasDiscount(plan) && (
                    <span className="text-xl font-bold text-slate-400 line-through decoration-slate-300 decoration-2">
                      {formatPrice(getOriginalPrice(plan))}
                    </span>
                  )}
                </div>

                {plan.monthlyPrice > 0 && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">
                    {isYearly ? "billed annually" : "billed monthly"}
                  </span>
                )}
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
                          plan.isPopular ? "bg-indigo-50" : "bg-slate-50",
                        )}
                      >
                        <Check
                          size={12}
                          className={
                            plan.isPopular
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
                  plan.isPopular
                    ? "bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-100/50 hover:-translate-y-1"
                    : "bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200 hover:-translate-y-1",
                )}
              >
                <Link
                  href={
                    plan.monthlyPrice === 0
                      ? "/"
                      : `/checkout?period=${
                          isYearly ? "yearly" : "monthly"
                        }&planId=${plan.id}`
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
    </>
  );
}
