/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense } from "react";
import { Check, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthGuard } from "@/guards/auth-guard";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "monthly";
  const isYearly = period === "yearly";

  const basePrice = isYearly ? 450000 : 36000;
  const discount = isYearly ? 0.2 : 0;
  const totalPrice = basePrice * (1 - discount);

  const handlePayment = () => {
    console.log("Initiating MoMo payment...", {
      plan: "VIP PREMIUM",
      period: period,
      basePrice: basePrice,
      totalAmount: totalPrice,
      currency: "VND",
      timestamp: new Date().toISOString(),
    });
    alert("Redirecting to MoMo payment gateway... (Check console for details)");
  };

  return (
    <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
        {/* Left Column: Payment Methods */}
        <div className="space-y-10">
          <div className="space-y-4">
            <Link
              href="/pricing"
              className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text(indigo-600) transition-colors flex items-center gap-2"
            >
              <ArrowRight size={14} className="rotate-180" /> Back to plans
            </Link>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Complete your{" "}
              <span className="text-indigo-600">VIP Upgrade.</span>
            </h1>
            <p className="text-slate-500 text-base max-w-lg font-medium">
              Pay securely via MoMo to unlock institutional-grade AI insights
              instantly.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Payment Gateway
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <button
                className={cn(
                  "flex items-center p-4 md:p-5 rounded-3xl border-2 border-slate-900 bg-slate-50 transition-all duration-500 gap-4",
                  "shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] scale-[1.01]",
                )}
              >
                <div className="p-1 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src="/MOMO-Logo-App.png"
                    className="w-10 h-10 object-contain"
                    alt="MoMo Logo"
                  />
                </div>
                <div className="text-left space-y-1 flex-1">
                  <span className="text-base font-black uppercase tracking-tight text-slate-900 leading-none block">
                    MoMo Wallet
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      Default
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest whitespace-nowrap">
                      Instant
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-slate-900 text-white p-1 rounded-full">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest text-slate-950 leading-none">
                    Selected
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Simple Confirmation Card */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                Checkout Summary
              </h3>
              <p className="text-center text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                You will be redirected to the official MoMo gateway to safely
                authorize your payment.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full h-16 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-[0.2em] hover:bg-pink-600 transition-all shadow-xl shadow-slate-200"
            >
              Proceed to MoMo
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <Lock size={12} strokeWidth={3} /> Official Secure Redirection
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-900/20 overflow-hidden relative">
            {/* Glow Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/30 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
                  Selected Plan
                </h3>
                <div className="text-2xl font-black tracking-tight">
                  VIP PREMIUM
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">
                    Billed Mode
                  </span>
                  <span className="font-bold uppercase tracking-wider">
                    {period}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Base Price</span>
                  <span className="font-bold underline decoration-indigo-500/50 underline-offset-4 tracking-tight">
                    {basePrice.toLocaleString()} VND
                  </span>
                </div>
                {isYearly && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-400 font-medium">
                      Applied Discount
                    </span>
                    <span className="font-black text-emerald-400">- 20%</span>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/10 flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 leading-none">
                  Total Due
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter">
                    {totalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    vnd
                  </span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                {[
                  "Priority Support",
                  "AI Signals Included",
                  "Full News Access",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-[11px] font-bold text-slate-300 uppercase tracking-widest"
                  >
                    <div className="bg-indigo-500/20 rounded-full p-0.5">
                      <Check
                        size={10}
                        className="text-indigo-400"
                        strokeWidth={4}
                      />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border border-slate-200 rounded-3xl flex items-center gap-4 bg-white/50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={20} strokeWidth={3} />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-black uppercase tracking-tight text-slate-900">
                Buyer Protection
              </p>
              <p className="text-[10px] font-medium text-slate-500 leading-snug">
                Full guarantee for up to 14 days after purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white pb-20">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center font-bold text-slate-400 animate-pulse">
            Loading Checkout...
          </div>
        }
      >
        <AuthGuard>
          <CheckoutContent />
        </AuthGuard>
      </Suspense>
    </div>
  );
}
