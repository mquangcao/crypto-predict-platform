"use client";

import {
  useGetAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useApplyDiscount,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Plus,
  Settings2,
  Trash2,
  TrendingDown,
  Loader2,
  Database,
  Layers,
  BarChart3,
  Globe,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminPlansPage() {
  const queryClient = useQueryClient();
  const { data: plansResponse, isLoading } = useGetAdminPlans();
  const plans = useMemo(() => plansResponse?.data || [], [plansResponse]);

  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const discountPlan = useApplyDiscount();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [discountingPlan, setDiscountingPlan] = useState<any>(null);

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

  const [discountData, setDiscountData] = useState({
    monthlyDiscountPrice: null as number | null,
    yearlyDiscountPrice: null as number | null,
  });

  const handleOpenCreate = () => {
    setEditingPlan(null);
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
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
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
    setIsDialogOpen(true);
  };

  const handleOpenDiscount = (plan: any) => {
    setDiscountingPlan(plan);
    const toPercent = (val: any) => {
      if (!val) return null;
      const num = Number(val);
      return num <= 1 ? Math.round((1 - num) * 100) : num;
    };

    setDiscountData({
      monthlyDiscountPrice: toPercent(plan.monthlyDiscountPrice),
      yearlyDiscountPrice: toPercent(plan.yearlyDiscountPrice),
    });
    setIsDiscountDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingPlan
      ? updatePlan.mutateAsync({
          route: { id: editingPlan.id },
          variables: formData,
        } as any)
      : createPlan.mutateAsync({ variables: formData } as any);

    toast.promise(action, {
      loading: "Saving plan changes...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
        queryClient.invalidateQueries({ queryKey: ["plans"] });
        setIsDialogOpen(false);
        return "Plan updated successfully.";
      },
      error: "Failed to save changes.",
    });
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountingPlan?.id) return;

    const toFactor = (val: any) => {
      if (val === null || val === "") return null;
      const num = Number(val);
      return num <= 100 ? Number((1 - num / 100).toFixed(2)) : num;
    };

    const variables = {
      monthlyDiscountPrice: toFactor(discountData.monthlyDiscountPrice),
      yearlyDiscountPrice: toFactor(discountData.yearlyDiscountPrice),
    };

    const action = discountPlan.mutateAsync({
      route: { id: discountingPlan.id },
      variables: variables,
    } as any);

    toast.promise(action, {
      loading: "Applying discount settings...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
        setIsDiscountDialogOpen(false);
        return "Discounts updated.";
      },
      error: "Failed to apply discounts.",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    const action = deletePlan.mutateAsync({
      route: { id },
      model: {} as any,
    } as any);
    toast.promise(action, {
      loading: "Deleting plan...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
        return "Plan deleted.";
      },
      error: "Failed to delete plan.",
    });
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("vi-VN").format(p);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-800 font-sans selection:bg-indigo-600 selection:text-white pb-32">
      <div className="absolute top-0 inset-x-0 h-1 bg-slate-900" />

      <div className="max-w-[1400px] mx-auto px-10 pt-24 space-y-16">
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
                Configure subscription tiers, billing cycles, and platform
                features.
              </p>
            </div>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="h-14 px-10 bg-slate-900 hover:bg-slate-800 text-white rounded-none font-bold uppercase text-xs tracking-widest shadow-xl transition-all font-sans"
          >
            <Plus size={18} className="mr-2" /> ADD NEW PLAN
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {plans.map(
            (p) =>
              p && (
                <div
                  key={p.id}
                  className={cn(
                    "group relative bg-white border border-slate-200 flex flex-col transition-all duration-300 hover:border-indigo-600 hover:shadow-2xl font-sans",
                    !p.isActive &&
                      "opacity-40 grayscale-[0.5] border-dashed bg-slate-50",
                  )}
                >
                  <div
                    className={cn(
                      "h-1 w-full z-20",
                      p.isPopular
                        ? "bg-indigo-600"
                        : "bg-slate-100 group-hover:bg-slate-900",
                    )}
                  />

                  <div className="p-10 flex flex-col flex-1 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              p.isActive ? "bg-emerald-500" : "bg-slate-300",
                            )}
                          />
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                            {p.id.slice(0, 6)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.tag && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 border border-indigo-100">
                            {p.tag}
                          </span>
                        )}
                        {p.cta && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-200">
                            {p.cta}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-medium">
                        {p.description ||
                          "No description provided for this plan."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border-l-2 border-indigo-500">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Monthly
                        </p>
                        <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                          {formatPrice(p.monthlyPrice)}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 border-l-2 border-slate-200 group-hover:border-slate-900 transition-colors">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Annual
                        </p>
                        <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                          {formatPrice(p.yearlyPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-2 relative z-40">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenDiscount(p)}
                        className="h-11 flex-1 rounded-none border-slate-200 bg-white hover:text-indigo-600 hover:border-indigo-600 font-bold uppercase text-[10px] tracking-wider font-sans"
                      >
                        Discount
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleOpenEdit(p)}
                        className="h-11 flex-1 rounded-none border-slate-200 bg-white hover:border-indigo-600 hover:bg-slate-900 hover:text-white font-bold uppercase text-[10px] tracking-wider font-sans"
                      >
                        Edit Plan
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(p.id)}
                        className="h-11 w-11 rounded-none border-slate-200 bg-white hover:text-rose-600 flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ),
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[1100px] w-[96vw] bg-white border border-slate-300 p-0 overflow-hidden shadow-2xl rounded-none font-sans">
          <div className="p-6 border-b border-slate-100 bg-[#f9fafb] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-none">
                <Settings2 size={20} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-950 tracking-tight uppercase leading-none italic">
                  {editingPlan
                    ? "EDIT SUBSCRIPTION PLAN"
                    : "ADD NEW SUBSCRIPTION PLAN"}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Environment: Production Settings
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col font-sans">
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
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
                          .map((f) => f.trim()),
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
                        {formData.isActive
                          ? "Active Status"
                          : "Disabled Status"}
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
                onClick={() => setIsDialogOpen(false)}
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

      <Dialog
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
      >
        <DialogContent className="sm:max-w-md bg-white border border-slate-300 rounded-none p-12 space-y-10 shadow-2xl font-sans">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-950 uppercase tracking-tight flex items-center gap-3">
              <TrendingDown className="text-indigo-600" /> Discount Settings
            </h2>
            <div className="bg-slate-100 px-3 py-1 inline-block">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                {discountingPlan?.name}
              </p>
            </div>
          </div>
          <form onSubmit={handleDiscountSubmit} className="space-y-8 font-sans">
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
              * Note: Enter percentage (e.g. 20 for 20% off). Values &gt; 100
              are treated as fixed prices.
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
  );
}
