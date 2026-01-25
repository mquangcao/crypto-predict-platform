import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useDeletePlan } from "@/hooks";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PlanDeleteConfirmDialogProps {
  plan: any;
  trigger: React.ReactNode;
}

export function PlanDeleteConfirmDialog({
  plan,
  trigger,
}: PlanDeleteConfirmDialogProps) {
  const queryClient = useQueryClient();
  const deletePlan = useDeletePlan();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    if (!plan?.id) return;
    const action = deletePlan.mutateAsync({
      route: { id: plan.id },
      model: {} as any,
    } as any);

    toast.promise(action, {
      loading: "Deleting plan...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
        queryClient.invalidateQueries({ queryKey: ["public-plans"] });
        setOpen(false);
        return "Plan deleted.";
      },
      error: "Failed to delete plan.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-white border border-slate-200 rounded-none p-8 font-sans">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
              Delete Plan?
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Confirming will permanently remove{" "}
              <span className="font-bold text-slate-950">
                &quot;{plan?.name}&quot;
              </span>
              . This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              className="flex-1 h-12 rounded-none bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-[10px]"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-12 rounded-none border-slate-200 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-900"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
