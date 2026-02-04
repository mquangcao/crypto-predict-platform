import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlanModifierDialog } from "./plan-modifier-dialog";
import { PlanDiscountDialog } from "./plan-discount-dialog";
import { PlanDeleteConfirmDialog } from "./plan-delete-confirm-dialog";

interface PlanCardProps {
  plan: any;
  formatPrice: (p: number) => string;
}

export function PlanCard({ plan, formatPrice }: PlanCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-white border border-slate-200 flex flex-col transition-all duration-300 hover:border-indigo-600 hover:shadow-2xl font-sans",
        !plan.isActive &&
          "opacity-40 grayscale-[0.5] border-dashed bg-slate-50",
      )}
    >
      <div
        className={cn(
          "h-1 w-full z-20",
          plan.isPopular
            ? "bg-indigo-600"
            : "bg-slate-100 group-hover:bg-slate-900",
        )}
      />

      <div className="p-10 flex flex-col flex-1 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              {plan.name}
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  plan.isActive ? "bg-emerald-500" : "bg-slate-300",
                )}
              />
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                {plan.id.slice(0, 6)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.tag && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 border border-indigo-100">
                {plan.tag}
              </span>
            )}
            {plan.cta && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-200">
                {plan.cta}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">
            {plan.description || "No description provided for this plan."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border-l-2 border-indigo-500">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Monthly
            </p>
            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {formatPrice(plan.monthlyPrice)}
            </p>
          </div>
          <div className="p-4 bg-slate-50 border-l-2 border-slate-200 group-hover:border-slate-900 transition-colors">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Annual
            </p>
            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {formatPrice(plan.yearlyPrice)}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2 relative z-40">
          <PlanDiscountDialog
            plan={plan}
            trigger={
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-none border-slate-200 bg-white hover:text-indigo-600 hover:border-indigo-600 font-bold uppercase text-[10px] tracking-wider font-sans"
              >
                Discount
              </Button>
            }
          />
          <PlanModifierDialog
            plan={plan}
            trigger={
              <Button
                variant="outline"
                className="h-11 flex-1 rounded-none border-slate-200 bg-white hover:border-indigo-600 hover:bg-slate-900 hover:text-white font-bold uppercase text-[10px] tracking-wider font-sans"
              >
                Edit Plan
              </Button>
            }
          />
          <PlanDeleteConfirmDialog
            plan={plan}
            trigger={
              <Button
                variant="outline"
                className="h-11 w-11 rounded-none border-slate-200 bg-white hover:text-rose-600 flex items-center justify-center shrink-0"
              >
                <Trash2 size={16} />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
