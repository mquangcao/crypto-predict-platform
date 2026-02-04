"use client";

import { PlansSection } from "./_components/plans-section";
import { useGetMySubscription, useAuth } from "@/hooks";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const { data: subData } = useGetMySubscription({
    options: { enabled: isAuthenticated },
  });
  const subscription = subData?.data;
  const isVip = subscription && subscription.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12 md:py-16">
        {/* Compact Typography Header */}
        <div className="space-y-4 mb-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="text-indigo-600 font-bold tracking-widest uppercase text-[10px]">
                Pricing & Plans
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Professional tools. <br />
                <span className="text-slate-400">Straightforward pricing.</span>
              </h1>
            </div>

            {isVip && (
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-3 min-w-[280px] animate-in fade-in slide-in-from-right-2 duration-500 relative overflow-hidden">
                {/* Subtle side accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>

                <div className="flex items-center justify-between pl-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 opacity-80">
                      Member Status
                    </span>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      VIP ACCOUNT
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full ml-2"></div>

                <div className="flex items-center justify-between gap-6 pl-2">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      Plan
                    </p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">
                      {subscription.planName}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center justify-end gap-1 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                      <Calendar size={10} />
                      Renewal
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {format(new Date(subscription.endDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-slate-500 text-base md:text-lg max-w-lg font-medium pt-1 text-balance">
            Choose the plan that fits your trading style. No hidden fees, just
            pure data intelligence.
          </p>
        </div>

        <PlansSection />
      </main>
    </div>
  );
}
