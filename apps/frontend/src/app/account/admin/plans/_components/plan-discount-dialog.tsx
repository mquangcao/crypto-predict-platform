import { TrendingDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useApplyDiscount } from "@/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PlanDiscountDialogProps {
  plan: any;
  trigger: React.ReactNode;
}

export function PlanDiscountDialog({ plan, trigger }: PlanDiscountDialogProps) {
  const queryClient = useQueryClient();
  const applyDiscount = useApplyDiscount();
  const [open, setOpen] = useState(false);

  const [discountData, setDiscountData] = useState({
    monthlyDiscountPrice: null as number | null,
    yearlyDiscountPrice: null as number | null,
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && plan) {
      const toPercent = (val: any) => {
        if (!val) return null;
        const num = Number(val);
        return num <= 1 ? Math.round((1 - num) * 100) : num;
      };

      setDiscountData({
        monthlyDiscountPrice: toPercent(plan.monthlyDiscountPrice),
        yearlyDiscountPrice: toPercent(plan.yearlyDiscountPrice),
      });
    }
    setOpen(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toFactor = (val: any) => {
      if (val === null || val === "") return null;
      const num = Number(val);
      return num <= 100 ? Number((1 - num / 100).toFixed(2)) : num;
    };

    const action = applyDiscount.mutateAsync({
      route: { id: plan.id },
      variables: {
        monthlyDiscountPrice: toFactor(discountData.monthlyDiscountPrice),
        yearlyDiscountPrice: toFactor(discountData.yearlyDiscountPrice),
      },
    } as any);

    toast.promise(action, {
      loading: "Applying discount settings...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
        queryClient.invalidateQueries({ queryKey: ["public-plans"] });
        setOpen(false);
        return "Discounts updated.";
      },
      error: "Failed to apply discounts.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-slate-300 rounded-none p-12 space-y-10 shadow-2xl font-sans">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-950 uppercase tracking-tight flex items-center gap-3">
            <TrendingDown className="text-indigo-600" /> Discount Settings
          </h2>
          <div className="bg-slate-100 px-3 py-1 inline-block">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              {plan?.name}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 font-sans">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Monthly Discount (%)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="1"
                  value={discountData.monthlyDiscountPrice || ""}
                  onChange={(e) =>
                    setDiscountData({
                      ...discountData,
                      monthlyDiscountPrice: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="h-14 rounded-none border-slate-200 font-bold text-indigo-600 bg-slate-50 text-xl pr-10 font-mono tracking-tight"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-indigo-600 font-mono">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Annual Discount (%)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="1"
                  value={discountData.yearlyDiscountPrice || ""}
                  onChange={(e) =>
                    setDiscountData({
                      ...discountData,
                      yearlyDiscountPrice: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="h-14 rounded-none border-slate-200 font-bold text-indigo-600 bg-slate-50 text-xl pr-10 font-mono tracking-tight"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-indigo-600 font-mono">
                  %
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 italic leading-relaxed">
            * Note: Enter percentage (e.g. 20 for 20% off). Values &gt; 100 are
            treated as fixed prices.
          </div>
          <Button
            type="submit"
            className="w-full h-16 rounded-none bg-slate-900 text-white font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 font-sans"
          >
            Apply Discounts <ShieldCheck size={18} />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
