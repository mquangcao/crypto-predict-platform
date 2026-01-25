import { Plus, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanModifierDialog } from "./plan-modifier-dialog";

export function PlanHeader() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
      <div className="space-y-4 font-sans">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-slate-900" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Administration Dashboard
          </p>
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            MANAGE <span className="text-slate-200">/</span> PLANS
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">
            Configure subscription tiers, billing cycles, and platform features.
          </p>
        </div>
      </div>

      <PlanModifierDialog
        trigger={
          <Button className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-none font-bold uppercase text-xs tracking-widest shadow-xl transition-all font-sans">
            <Plus size={18} className="mr-2" /> ADD NEW PLAN
          </Button>
        }
      />
    </header>
  );
}
