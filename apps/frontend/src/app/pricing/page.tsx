"use client";

import { PlansSection } from "./_components/plans-section";
import { useGetMySubscription, useAuth } from "@/hooks";
import { Crown, Calendar } from "lucide-react";
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
              <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl shadow-slate-900/20 flex flex-col gap-3 min-w-[280px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-400 p-1.5 rounded-full">
                      <Crown
                        size={14}
                        className="text-slate-900"
                        fill="currentColor"
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      VIP Member
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Active
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xl font-black tracking-tight">
                    {subscription.planName}
                  </p>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar size={12} />
                    Expires:{" "}
                    {format(new Date(subscription.endDate), "dd/MM/yyyy")}
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
