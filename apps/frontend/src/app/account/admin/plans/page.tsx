"use client";

import { useGetAdminPlans } from "@/hooks";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { PlanHeader, PlanCard } from "./_components";
import { AdminGuard } from "@/guards/admin-guard";

export default function AdminPlansPage() {
  const { data: plansResponse, isLoading } = useGetAdminPlans();
  const plans = useMemo(() => plansResponse?.data || [], [plansResponse]);

  const formatPrice = (p: number) => new Intl.NumberFormat("vi-VN").format(p);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#fcfdfe] text-slate-800 font-sans selection:bg-indigo-600 selection:text-white pb-32">
        <div className="absolute top-0 inset-x-0 h-1 bg-slate-900" />

        <div className="max-w-[1400px] mx-auto px-10 pt-24 space-y-16">
          <PlanHeader />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {plans.map(
              (p) =>
                p && <PlanCard key={p.id} plan={p} formatPrice={formatPrice} />,
            )}
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #ccc;
          }
        `}</style>
      </div>
    </AdminGuard>
  );
}
