import {
  Settings2,
  Globe,
  Layers,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCreatePlan, useUpdatePlan } from "@/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PlanModifierDialogProps {
  plan?: any;
  trigger: React.ReactNode;
}

export function PlanModifierDialog({ plan, trigger }: PlanModifierDialogProps) {
  const queryClient = useQueryClient();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isPopular: false,
    tag: "",
    cta: "",
    features: [] as string[],
    isActive: true,
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (plan) {
        setFormData({
          name: plan.name || "",
          description: plan.description || "",
          monthlyPrice: Number(plan.monthlyPrice || 0),
          yearlyPrice: Number(plan.yearlyPrice || 0),
          isPopular: !!plan.isPopular,
          tag: plan.tag || "",
          cta: plan.cta || "",
          features: plan.features || [],
          isActive: plan.isActive !== undefined ? plan.isActive : true,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          monthlyPrice: 0,
          yearlyPrice: 0,
          isPopular: false,
          tag: "",
          cta: "",
          features: [],
          isActive: true,
        });
      }
    }
    setOpen(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = plan
      ? updatePlan.mutateAsync({
          route: { id: plan.id },
          variables: formData,
        } as any)
      : createPlan.mutateAsync({ variables: formData } as any);

    toast.promise(action, {
      loading: "Saving plan changes...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
        queryClient.invalidateQueries({ queryKey: ["public-plans"] });
        setOpen(false);
        return plan ? "Plan updated." : "Plan created.";
      },
      error: "Failed to save changes.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[1100px] w-[96vw] bg-white border border-slate-300 p-0 overflow-hidden shadow-2xl rounded-none font-sans">
        <div className="p-6 border-b border-slate-100 bg-[#f9fafb] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-none">
              <Settings2 size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-950 tracking-tight uppercase leading-none italic">
                {plan ? "EDIT SUBSCRIPTION PLAN" : "ADD NEW SUBSCRIPTION PLAN"}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Environment: Production Settings
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col font-sans">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-slate-50 pb-8">
              <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                  01. Identity
                </Label>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">
                    Plan Name
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-12 rounded-none border-slate-200 font-bold text-lg focus:border-indigo-600 ring-0 font-sans"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                  02. Labeling
                </Label>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">
                    Display Tag
                  </Label>
                  <Input
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({ ...formData, tag: e.target.value })
                    }
                    className="h-12 rounded-none border-slate-200 font-bold text-indigo-600 font-sans"
                    placeholder="E.G. POPULAR"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                  03. Interaction
                </Label>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">
                    Call to Action (CTA)
                  </Label>
                  <Input
                    value={formData.cta}
                    onChange={(e) =>
                      setFormData({ ...formData, cta: e.target.value })
                    }
                    className="h-12 rounded-none border-slate-200 font-bold font-sans"
                    placeholder="Go Premium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-slate-50 pb-8">
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <Globe size={14} /> Marketing Description
                </p>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[140px] rounded-none border-slate-200 font-medium text-slate-600 resize-none p-4 font-sans"
                  placeholder="Briefly describe what this plan offers..."
                />
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <Layers size={14} /> Plan Features
                </p>
                <Textarea
                  value={formData.features.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: e.target.value
                        .split(",")
                        .map((f: string) => f.trim()),
                    })
                  }
                  className="min-h-[140px] rounded-none border-slate-200 text-sm font-medium text-slate-500 resize-none p-4 font-sans"
                  placeholder="Feature 1, Feature 2, Feature 3..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                  <BarChart3 size={14} /> Pricing Setup
                </p>
                <div className="grid grid-cols-2 gap-8 p-6 bg-[#f9fafb] border border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">
                      Monthly Price (VND)
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.monthlyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyPrice: Number(e.target.value),
                          })
                        }
                        className="bg-white border-slate-200 h-12 rounded-none font-mono font-bold text-xl pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-300">
                        VND
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">
                      Annual Price (VND)
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.yearlyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            yearlyPrice: Number(e.target.value),
                          })
                        }
                        className="bg-white border-slate-200 h-12 rounded-none font-mono font-bold text-xl pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-300">
                        VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col justify-end space-y-4">
                <div className="flex items-center justify-between p-7 border border-slate-200 bg-white relative shadow-sm">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Highlight Plan
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold italic tracking-tighter">
                      Recommended choice
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPopular}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, isPopular: v })
                    }
                  />
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between p-7 border relative transition-all shadow-sm",
                    formData.isActive
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-rose-200 bg-rose-50/30",
                  )}
                >
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "font-bold text-xs uppercase tracking-wider",
                        formData.isActive
                          ? "text-emerald-700"
                          : "text-rose-700",
                      )}
                    >
                      {formData.isActive ? "Active Status" : "Disabled Status"}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold italic tracking-tighter">
                      Visible to customers
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, isActive: v })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-100 bg-[#f9fafb] flex justify-end gap-4 shrink-0 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-12 px-8 rounded-none font-bold uppercase text-[11px] tracking-widest text-slate-400 hover:text-slate-900 font-sans"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 px-12 rounded-none bg-slate-900 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[11px] transition-all flex gap-3 font-sans"
            >
              Save Changes <ChevronRight size={18} />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
