"use client";

import { PlansSection } from "./_components/plans-section";

export default function PricingPage() {
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

        <PlansSection />
      </main>
    </div>
  );
}
